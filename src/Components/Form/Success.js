import React from "react";
import { Box, Heading, VStack, Button } from "@chakra-ui/react";
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
          Si voleu introduir un nou usuari, premeu el botó
        </Heading>
        <Link to="/Ingressar-alumnes">
          <Button colorScheme="blackAlpha" mt={18} mb={18}>
            Començar el ingrés
          </Button>
        </Link>
      </VStack>
    </Box>
  );
};

export default Success;
