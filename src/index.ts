import express from 'express';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import passport from 'passport';
import { passportConfig } from './passport';
import cors from 'cors';

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
passportConfig(passport);
app.use(passport.initialize());
app.use(cors(
  {
    origin: "*",
    credentials: true,
  }
));


app.use("/api", routes);
app.use(errorHandler);

app.listen(3000, () =>
  console.log(`Server ready at: http://localhost:3000`),
)
