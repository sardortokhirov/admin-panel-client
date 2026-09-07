import apiService from "./apiService";

const API_URL = "/humo/newNumber";
const API_URLSmsCode = "/humo/smscode";
const API_URLtwoStep = "/humo/twostep";
const API_URLActive = "/humo/active?include_photo=true";
const newNumber = (data) => apiService.post(API_URL, data);
const smsCode = (data) => apiService.post(API_URLSmsCode, data);
const twoStep = (data) => apiService.post(API_URLtwoStep, data);

const active = (data) => apiService.get(API_URLActive);
const deleteAccount = (number) =>
  apiService.delete(`/humo/delete?phone=${number}`);

const humoService = { newNumber, smsCode, twoStep, active, deleteAccount };

export default humoService;
