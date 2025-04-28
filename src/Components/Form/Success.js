import React from "react";
import { Box, Heading, VStack, Button, HStack } from "@chakra-ui/react";
import { Link } from "wouter";
const Success = () => {
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
          ¡Alumne carregat amb èxit!
        </Heading>
        <Heading
          as="h2"
          fontFamily="'Hanken Grotesk', Arial, sans-serif"
          size="lg"
          w={{ base: 400, md: 800 }}
          textAlign={"center"}
        >
          Alumne afegit amb èxit, si voleu introduir un nou usuari, premeu el botó
        </Heading>
        <HStack spacing={4} mt={18} mb={18}>
          <Link to="/Ingressar-alumnes">
            <Button colorScheme="blackAlpha">
              Començar el ingrés
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

export default Success;