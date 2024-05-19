import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { Route } from "wouter";
import { Box } from "@chakra-ui/react";
import Nav from "./Components/Nav/Nav";
import HomePage from "./Components/HomePage/HomePage";
import StudentsForm from "./Components/Form/StudentsForm";
import Success from "./Components/Form/Success";
import RestaurantsForm from "./Components/Form/RestaurantsForm";
import SuccessRest from "./Components/Form/SuccessRest";
import ShowAllAlumns from "./Components/ShowAllAlumns/ShowAllAlumns";
import ShowAllRestaurants from "./Components/ShowAllRestaurants/ShowAllRestaurants";
import EditStudentForm from "./Components/Form/EditStudentForm";
import EditRestaurantForm from "./Components/Form/EditRestaurantForm";
import LoginForm from "./Components/Form/Login";
import { AuthProvider } from "./Components/AuthContext";
import PrivateRoute from "./Components/PrivateRoute";

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Box as="header">
          <Nav />
          <Route path="/" component={LoginForm} />
        </Box>
        <PrivateRoute path="/home" component={HomePage} />
        <PrivateRoute path="/Ingressar-alumnes" component={StudentsForm} />
        <PrivateRoute path="/veure-alumnes" component={ShowAllAlumns} />
        <PrivateRoute path="/success" component={Success} />
        <PrivateRoute
          path="/Ingressar-restaurants"
          component={RestaurantsForm}
        />
        <PrivateRoute
          path="/veure-restaurants"
          component={ShowAllRestaurants}
        />
        <PrivateRoute path="/success-restaurant" component={SuccessRest} />
        <PrivateRoute path="/edit-alumn/:id" component={EditStudentForm} />
        <PrivateRoute
          path="/edit-restaurant/:id"
          component={EditRestaurantForm}
        />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
