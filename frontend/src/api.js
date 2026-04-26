import axios from 'axios';
import { setupApiInterceptors } from './utils/apiInterceptors';

const api = setupApiInterceptors(axios.create({
    baseURL: 'http://localhost:8081/api', // Auth Service Port
}));

export default api;