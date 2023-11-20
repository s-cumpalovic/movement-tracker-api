import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';

import { APP_PORT, corsOptions, finalVideoDir, persistentVideoDir, temporaryImageDir, temporaryVideoDir } from './utilities/constants';
import coordinateRoutes from './api/routes/coordinateRoute';
import videoRoutes from './api/routes/videoRoute';
import createRoutes from './api/routes/createRoute';
import getRecordsRoute from './api/routes/getRecordsRoute';
import getVideoByIdRoute from './api/routes/getVideoByIdRoute';
import deleteVideoRoute from './api/routes/deleteVideoRoute';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use('/static/temporary-image', express.static(temporaryImageDir));
app.use('/static/final-video', express.static(finalVideoDir));
app.use('/static/temp-video', express.static(temporaryVideoDir));
app.use('/static/video', express.static(persistentVideoDir));

app.use('/api/upload', videoRoutes);
app.use('/api/coordinates', coordinateRoutes);
app.use('/api/create', createRoutes);
app.use('/api/records', getRecordsRoute);
app.use('/api', getVideoByIdRoute);
app.use('/api', deleteVideoRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  if (err instanceof Error) {
    console.error(`An error occurred: ${err.message}`);
    res.status(500).send(err.message);
  } else {
    console.error(`An error occurred: ${err}`);
    res.status(500).send('An internal server error occurred');
  }
});

app.listen(APP_PORT, () => {
  console.log(`Server started on port ${APP_PORT}`);
});
