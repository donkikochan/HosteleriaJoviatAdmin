import React, { useState } from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button,
  VStack,
  Select,
  Box,
  Heading,
} from "@chakra-ui/react";
import { useLocation } from "wouter";

import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
} from "@firebase/firestore";
import { app } from "../../firebaseConfig";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const StudentsForm = () => {
  const fetchDatos = async () => {
    console.log("Hola mundo");
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, "users"));
    const datosFetched = querySnapshot.docs.map((doc) => doc.data());
    console.log(datosFetched);
  };
  const [nom, setNom] = useState("");
  const [cognom, setCognom] = useState("");
  const [correu, setCorreu] = useState("");
  const [contrasenya, setContrasenya] = useState("");
  const [academicStatus, setacademicStatus] = useState("");
  const [birth, setbirth] = useState("");
  const [username, setusername] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [mobile, setMobile] = useState("");
  const [touchedFields, setTouchedFields] = useState({
    nom: false,
    cognom: false,
    correu: false,
    contrasenya: false,
    academicStatus: false,
    birth: false,
    username: false
  });
  const [location, navigate] = useLocation();

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
  const handleacademicStatusChange = (e) => {
    setacademicStatus(e.target.value);
  };
  const handlebirthChange = (e) => {
    setbirth(e.target.value);
  };
  const handleusernameChange = (e) => {
    setusername(e.target.value);
  };

  const handleBlur = (field) => {
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      [field]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      nom === "" ||
      cognom === "" ||
      correu === "" ||
      contrasenya === "" ||
      username === "" ||
      birth === "" ||
      academicStatus === ""
    ) {
      alert("Error: Completa todos los campos obligatorios");
    } else {
      const defaultImageUrl =
        "https://cdn.icon-icons.com/icons2/1369/PNG/512/-person_90382.png";

      try {
        // se crea usuario en Firebase Authentication
        const auth = getAuth(app);
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          correu,
          contrasenya
        );
        const user = userCredential.user;

        // se guardan otros datos en Firestore
        const db = getFirestore(app);
        await setDoc(doc(db, "users", user.uid), {
          nom,
          cognom,
          academicStatus,
          birth,
          username,
          linkedin,
          instagram,
          mobile,
          imageUrl: defaultImageUrl,
          email: user.email,
        });

        // se redirige al usuario a la página de éxito
        navigate("/success");
      } catch (error) {
        // Manejo de  errores de Firebase Authentication
        alert("Error al crear usuario: " + (error && error.message));
      }
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
       
      <FormControl maxW={600} isRequired>
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
      </FormControl>

      <FormControl  maxW={600} isRequired>
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
          </FormControl>

          <FormControl   maxW={600} isRequired>
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
          </FormControl>

          <FormControl  maxW={600} isRequired>
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
          </FormControl>

          <FormControl  maxW={600} isRequired>
          <FormLabel mt={5}>Estat academic</FormLabel>
          <Select value={academicStatus} onChange={handleacademicStatusChange}>
            <option value="">Selecciona una opción</option>
            <option value="Alumn">Alumn</option>
            <option value="Ex-alumn">Ex-alumn</option>
          </Select>
          <FormHelperText
            mt={1}
            color={
              touchedFields.academicStatus && academicStatus === ""
                ? "red"
                : "gray"
            }
          >
            Seleccione l'estat academic.
          </FormHelperText>
          </FormControl>

          <FormControl  maxW={600} isRequired>
          <FormLabel mt={5}>Data de naixement</FormLabel>
          <Input
            type="date"
            value={birth}
            onChange={handlebirthChange}
            onBlur={() => handleBlur("birth")}
            placeholder="Data de naixement"
            isInvalid={touchedFields.birth && birth === ""}
          />
          <FormHelperText 
            mt={1}
            color={touchedFields.birth && birth === "" ? "red" : "gray"}
          >
            Seleccione la data de naixement.
          </FormHelperText>
          </FormControl>

          <FormControl  maxW={600} isRequired>
          <FormLabel mt={5}>Nom d'usuari</FormLabel>
          <Input
            value={username}
            onChange={handleusernameChange}
            onBlur={() => handleBlur("username")}
            placeholder="Nom de usuari"
            isInvalid={touchedFields.username && username === ""}
          />
          <FormHelperText
            mt={1}
            color={touchedFields.username && username === "" ? "red" : "gray"}
          >
            Entre el nom d'usuari.
          </FormHelperText>
          </FormControl>

          <FormControl maxW={600}>
          <FormLabel mt={5}>LinkedIn</FormLabel>
          <Input
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          onBlur={() => handleBlur("linkedin")}
          placeholder="LinkedIn"
          isInvalid={touchedFields.linkedin && linkedin === ""}
        />
          </FormControl>

          <FormControl maxW={600}>
        <FormLabel mt={5}>Instagram</FormLabel>
        <Input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          onBlur={() => handleBlur("instagram")}
          placeholder="Instagram"
          isInvalid={touchedFields.instagram && instagram === ""}
        />
        </FormControl>

        <FormControl maxW={600}>
        <FormLabel mt={5}>Mòbil</FormLabel>
        <Input
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          onBlur={() => handleBlur("mobile")}
          placeholder="Mòbil"
          isInvalid={touchedFields.mobile && mobile === ""}
        />
        </FormControl>

          <Button mt={5} mb={20} colorScheme="blue" type="submit">
            Carregar
          </Button>
       
      </VStack>
    </Box>
  );
};

export default StudentsForm;
