import status from 'http-status';
import locationMessages from '../locales/en-US/location';
import Location from '../models/Location';
import { responseError, responseSuccess } from '../services/Response';

const addLocation = async (req, res) => {
  try {
    const { name } = req.body;
    const location = await Location.create({ name });
    return res.json(
      responseSuccess({
        data: { location },
        message: locationMessages.ADD_LOCATION_SUCCESSFULLY,
      }),
    );
  } catch (error) {
    return res.json(
      responseError({
        message: error.message,
        statusCode: status.INTERNAL_SERVER_ERROR,
      }),
    );
  }
};

const getListLocation = async (req, res) => {
  try {
    const locations = await Location.find();
    return res.json(
      responseSuccess({
        data: { locations },
        message: locationMessages.GET_LOCATION_LIST_SUCCESSFULLY,
      }),
    );
  } catch (error) {
    return res.json(
      responseError({
        message: error.message,
        statusCode: status.INTERNAL_SERVER_ERROR,
      }),
    );
  }
};

export default {
  addLocation,
  getListLocation,
};
