import React, { useState } from "react";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Button,
  VStack,
  Select,
  Box,
  Heading,
} from "@chakra-ui/react";
import { useRouter } from "wouter";

const StudentsForm = () => {
  const [nom, setNom] = useState("");
  const [cognom, setCognom] = useState("");
  const [correu, setCorreu] = useState("");
  const [contrasenya, setContrasenya] = useState("");
  const [estatAcademic, setEstatAcademic] = useState("");
  const [dataNaixement, setDataNaixement] = useState("");
  const [nomUsuari, setNomUsuari] = useState("");
  const [touchedFields, setTouchedFields] = useState({
    nom: false,
    cognom: false,
    correu: false,
    contrasenya: false,
    estatAcademic: false,
    dataNaixement: false,
    nomUsuari: false,
  });
  const router = useRouter();

  const handleNomChange = (e) => {
    setNom(e.target.value);
  };
  const handleCognomChange = (e) => {
    setCognom(e.target.value);
  };
  const handleCorreuChange = (e) => {
    setCorreu(e.target.value);
  };
  const handleContrasenyaChange = (e) => {
    setContrasenya(e.target.value);
  };
  const handleEstatAcademicChange = (e) => {
    setEstatAcademic(e.target.value);
  };
  const handleDataNaixementChange = (e) => {
    setDataNaixement(e.target.value);
  };
  const handleNomUsuariChange = (e) => {
    setNomUsuari(e.target.value);
  };

  const handleBlur = (field) => {
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      [field]: true,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      nom === "" ||
      cognom === "" ||
      correu === "" ||
      contrasenya === "" ||
      nomUsuari === "" ||
      dataNaixement === "" ||
      estatAcademic === ""
    ) {
      alert("Error: Completa todos los campos obligatorios");
    } else {
      router.push("/success");
    }
  };

  return (
    <Box>
      <VStack bg={"white"} width={"100%"} pt={150}>
        <Heading
          as="h1"
          fontFamily="'Hanken Grotesk', Arial, sans-serif"
          size="xl"
          w={{ base: "200", md: "600" }}
          maxW={600}
          mb={5}
          textAlign={"center"}
        >
          ¡Ja podeu començar a carregar les dades dels alumnes!
        </Heading>
      </VStack>
      <VStack as="form" onSubmit={handleSubmit}>
        <FormControl mt={50} maxW={600} isRequired>
          <FormLabel mt={5}>Nom</FormLabel>
          <Input
            type="text"
            value={nom}
            onChange={handleNomChange}
            onBlur={() => handleBlur("nom")}
            placeholder="Nom"
            isInvalid={touchedFields.nom && nom === ""}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.nom && nom === "" ? "red" : "gray"}
          >
            Entre el nom.
          </FormHelperText>
          <FormLabel mt={5}>Cognom</FormLabel>
          <Input
            type="text"
            value={cognom}
            onChange={handleCognomChange}
            onBlur={() => handleBlur("cognom")}
            placeholder="Cognom"
            isInvalid={touchedFields.cognom && cognom === ""}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.cognom && cognom === "" ? "red" : "gray"}
          >
            Entre el cognom.
          </FormHelperText>
          <FormLabel mt={5}>Correu</FormLabel>
          <Input
            type="email"
            value={correu}
            onChange={handleCorreuChange}
            onBlur={() => handleBlur("correu")}
            placeholder="Correu"
            isInvalid={touchedFields.correu && correu === ""}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.correu && correu === "" ? "red" : "gray"}
          >
            Entre el correu.
          </FormHelperText>
          <FormLabel mt={5}>Contrasenya</FormLabel>
          <Input
            type="password"
            value={contrasenya}
            onChange={handleContrasenyaChange}
            onBlur={() => handleBlur("contrasenya")}
            placeholder="Contrasenya"
            isInvalid={touchedFields.contrasenya && contrasenya === ""}
          />
          <FormHelperText
            mt={1}
            color={
              touchedFields.contrasenya && contrasenya === "" ? "red" : "gray"
            }
          >
            Entre la contrasenya.
          </FormHelperText>
          <FormLabel mt={5}>Estat academic</FormLabel>
          <Select value={estatAcademic} onChange={handleEstatAcademicChange}>
            <option value="">Selecciona una opción</option>
            <option value="Alumn">Alumn</option>
            <option value="Ex-alumn">Ex-alumn</option>
          </Select>
          <FormHelperText
            mt={1}
            color={
              touchedFields.estatAcademic && estatAcademic === ""
                ? "red"
                : "gray"
            }
          >
            Seleccione l'estat academic.
          </FormHelperText>
          <FormLabel mt={5}>Data de naixement</FormLabel>
          <Input
            type="date"
            value={dataNaixement}
            onChange={handleDataNaixementChange}
            onBlur={() => handleBlur("dataNaixement")}
            placeholder="Data de naixement"
            isInvalid={touchedFields.dataNaixement && dataNaixement === ""}
          />
          <FormHelperText
            mt={1}
            color={
              touchedFields.dataNaixement && dataNaixement === ""
                ? "red"
                : "gray"
            }
          >
            Seleccione la data de naixement.
          </FormHelperText>
          <FormLabel mt={5}>Nom d'usuari</FormLabel>
          <Input
            value={nomUsuari}
            onChange={handleNomUsuariChange}
            onBlur={() => handleBlur("nomUsuari")}
            placeholder="Nom de usuari"
            isInvalid={touchedFields.nomUsuari && nomUsuari === ""}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.nomUsuari && nomUsuari === "" ? "red" : "gray"}
          >
            Entre el nom d'usuari.
          </FormHelperText>

          <Button mt={5} mb={20} colorScheme="blue" type="submit">
            Carregar
          </Button>
        </FormControl>
      </VStack>
    </Box>
  );
};

export default StudentsForm;