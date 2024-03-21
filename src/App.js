import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { Route } from "wouter";
import { Box } from "framer-motion";
import Nav from "./Components/Nav/Nav";
import HomePage from "./Components/HomePage/HomePage";

function App() {
  return (
    <ChakraProvider>
      <Box as="header">
        <Nav />
        <Route path="/" component={HomePage} />
      </Box>
    </ChakraProvider>
  );
}

export default App;
