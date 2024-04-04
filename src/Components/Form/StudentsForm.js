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
} from "@chakra-ui/react";

const StudentsForm = () => {
  const [nom, setNom] = useState("");
  const [cognom, setCognom] = useState("");
  const [correu, setCorreu] = useState("");
  const [contrasenya, setContrasenya] = useState("");
  const [estatAcademic, setEstatAcademic] = useState("");
  const [dataNaixement, setDataNaixement] = useState("");
  const [nomUsuari, setNomUsuari] = useState("");

  const handleNomChange = (e) => setNom(e.target.value);
  const handleCognomChange = (e) => setCognom(e.target.value);
  const handleCorreuChange = (e) => setCorreu(e.target.value);
  const handleContrasenyaChange = (e) => setContrasenya(e.target.value);
  const handleEstatAcademicChange = (e) => setEstatAcademic(e.target.value);
  const handleDataNaixementChange = (e) => setDataNaixement(e.target.value);
  const handleNomUsuariChange = (e) => setNomUsuari(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      nom === "" ||
      cognom === "" ||
      correu === "" ||
      contrasenya === "" ||
      dataNaixement === ""
    ) {
      return;
    }
  };

  const isError =
    nom === "" ||
    cognom === "" ||
    correu === "" ||
    contrasenya === "" ||
    dataNaixement === "";

  return (
    <VStack>
      <FormControl mt={100} maxW={600} isRequired>
        <FormLabel mt={5}>Nom</FormLabel>
        <Input
          type="text"
          value={nom}
          onChange={handleNomChange}
          placeholder="Nom"
        />
        {!isError ? (
          <FormErrorMessage>El nom és obligatori</FormErrorMessage>
        ) : (
          <FormHelperText>Entre el nom.</FormHelperText>
        )}
        <FormLabel mt={5}>Cognom</FormLabel>
        <Input
          type="text"
          value={cognom}
          onChange={handleCognomChange}
          placeholder="Cognom"
        />
        {!isError ? (
          <FormErrorMessage>El cognom és obligatori</FormErrorMessage>
        ) : (
          <FormHelperText>Entre el cognom.</FormHelperText>
        )}
        <FormLabel mt={5}>Correu</FormLabel>
        <Input
          type="email"
          value={correu}
          onChange={handleCorreuChange}
          placeholder="Correu"
        />
        {!isError ? (
          <FormErrorMessage>El correu es obligatori</FormErrorMessage>
        ) : (
          <FormHelperText>Entre el correu.</FormHelperText>
        )}
        <FormLabel mt={5}>Contrasenya</FormLabel>
        <Input
          type="password"
          value={contrasenya}
          onChange={handleContrasenyaChange}
          placeholder="Contrasenya"
        />
        {!isError ? (
          <FormErrorMessage>La contrasenya es obligatoria</FormErrorMessage>
        ) : (
          <FormHelperText>Entre la contrasenya.</FormHelperText>
        )}
        <FormLabel mt={5}>Estat academic</FormLabel>
        <Select value={estatAcademic} onChange={handleEstatAcademicChange}>
          <option value="">Selecciona una opción</option>
          <option value="Alumn">Alumn</option>
          <option value="Ex-alumn">Ex-alumn</option>
        </Select>
        {!isError ? (
          <FormErrorMessage>Selecciona un estat acadèmic</FormErrorMessage>
        ) : (
          <FormHelperText>Selecciona un estat acadèmic.</FormHelperText>
        )}
        <FormLabel mt={5}>Data de naixement</FormLabel>
        <Input
          type="date"
          value={dataNaixement}
          onChange={handleDataNaixementChange}
          placeholder="Data de naixement"
        />
        {!isError ? (
          <FormErrorMessage>
            La data de naixement es obligatoria
          </FormErrorMessage>
        ) : (
          <FormHelperText>Entre la data de naixement.</FormHelperText>
        )}
        <FormLabel mt={5}>Nom d'usuari</FormLabel>
        <Input
          value={nomUsuari}
          onChange={handleNomUsuariChange}
          placeholder="Nom d'usuari"
        />
        {!isError ? (
          <FormErrorMessage>El nom d'usuari és obligatori</FormErrorMessage>
        ) : (
          <FormHelperText>Entre el nom d'usuari.</FormHelperText>
        )}

        <Button
          mt={5}
          mb={20}
          colorScheme="teal"
          type="submit"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </FormControl>
    </VStack>
  );
};

export default StudentsForm;
