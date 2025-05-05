import React from "react";
import { Box, Heading, VStack, Button, HStack } from "@chakra-ui/react";
import { Link } from "wouter";
const SuccessRest = () => {
  return (
    <Box>
      <VStack bg={"white"} width={"100%"} minHeight={"100vh"} pt={150}>
        <Heading
          as="h1"
          fontFamily="'Hanken Grotesk', Arial, sans-serif"
          size="2xl"
          w={500}
          maxW={600}
          mb={5}
          textAlign={"center"}
        >
          ¡Restaurant carregat amb èxit!
        </Heading>
        <Heading
          as="h2"
          fontFamily="'Hanken Grotesk', Arial, sans-serif"
          size="lg"
          w={{ base: 400, md: 800 }}
          textAlign={"center"}
        >
          Si voleu introduir un nou restaurant, premeu el botó
        </Heading>
        <HStack spacing={4} mt={18} mb={18}>
          <Link to="/Ingressar-restaurants">
            <Button colorScheme="blackAlpha">
              Començar la càrrega
            </Button>
          </Link>
          <Link to="/home">
            <Button colorScheme="blue">
              Tornar a l'inici
            </Button>
          </Link>
        </HStack>
      </VStack>
    </Box>
  );
};

export default SuccessRest;