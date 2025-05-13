import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './prisma';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET as string,
};

export const passportConfig = (passport: any): void => {
    passport.use(
        new JwtStrategy(opts, async (jwtPayload: { id: string; role: string }, done) => {
            try {
                const user = await prisma.user.findFirst({
                    where: { id: jwtPayload.id },
                });

                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }

                return done(null, {
                    id: user.id,
                    role: jwtPayload.role,
                });

            } catch (err) {
                console.error('Error in passport-jwt strategy:', err);
                return done(err, false);
            }
        })
    );

    // In passportConfig function
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;

                    // Check for existing user by email or Google ID
                    let user = await prisma.user.findFirst({
                        where: { OR: [{ email }, { googleId: profile.id }] }
                    });

                    if (!user) {
                        // Create new user if doesn't exist
                        user = await prisma.user.create({
                            data: {
                                firstName: profile.name?.givenName || 'User',
                                lastName: profile.name?.familyName || '',
                                email: email || '',
                                googleId: profile.id,
                                profileImage: profile.photos?.[0]?.value,
                                password: '', // Add empty password for schema compliance
                                phone: ''     // Add empty phone for schema compliance
                            }
                        });
                    } else {
                        // Update existing user with Google ID if missing
                        if (!user.googleId) {
                            user = await prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    googleId: profile.id,
                                    profileImage: profile.photos?.[0]?.value
                                }
                            });
                        }
                    }

                    return done(null, user);
                } catch (err) {
                    console.error('Google Strategy Error:', err);
                    return done(err, undefined);
                }
            }
        )
    );

};