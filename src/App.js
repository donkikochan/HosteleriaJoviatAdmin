import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { Route } from "wouter";
import { Box } from "@chakra-ui/react";
import Nav from "./Components/Nav/Nav";
import HomePage from "./Components/HomePage/HomePage";
import StudentsForm from "./Components/Form/StudentsForm";

function App() {
  return (
    <ChakraProvider>
      <Box as="header">
        <Nav />
        <Route path="/" component={HomePage} />
      </Box>
      <Route path="/carrega-alumnes" component={StudentsForm} />
    </ChakraProvider>
  );
}

export default App;
