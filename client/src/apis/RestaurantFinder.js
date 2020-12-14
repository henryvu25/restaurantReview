import axios from "axios";

//allows you to import this baseURL from other components
export default axios.create({
    baseURL: "http://localhost:3005/api/v1/restaurants",
});