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

function App() {
  return (
    <ChakraProvider>
      <Box as="header">
        <Nav />
        <Route path="/" component={HomePage} />
      </Box>
      <Route path="/carrega-alumnes" component={StudentsForm} />
      <Route path="/veure-alumnes" component={ShowAllAlumns} />
      <Route path="/success" component={Success} />
      <Route path="/carrega-restaurants" component={RestaurantsForm} />
      <Route path="/veure-restaurants" component={ShowAllRestaurants} />
      <Route path="/success-restaurant" component={SuccessRest} />
    </ChakraProvider>
  );
}

export default App;
