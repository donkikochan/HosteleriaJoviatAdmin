import { useState, useEffect } from "react"
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button,
  VStack,
  Box,
  Heading,
  Select,
  Checkbox,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Avatar,
  Flex,
  Stack,
  InputGroup,
  InputLeftElement,
  Text,
} from "@chakra-ui/react"
import { useLocation, Link } from "wouter"
import { AddIcon, DeleteIcon, SearchIcon } from "@chakra-ui/icons"

import { getFirestore, setDoc, doc, collection, getDocs, getDoc } from "@firebase/firestore"
import { app } from "../../firebaseConfig"

const RestaurantsForm = () => {
  const [nom, setNom] = useState("")
  const [tel, setTel] = useState("")
  const [web, setWeb] = useState("")
  const [longitud, setLongitud] = useState("")
  const [latitud, setLatitud] = useState("")
  const [instagram, setInstagram] = useState("")
  const [foto, setFotos] = useState([""])
  const [direccio, setDireccio] = useState("")
  const [descripcio, setDescripcio] = useState("")
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [responsabilitat, setResponsabilitat] = useState("")
  const [propietari, setPropietari] = useState(false)
  const [anydeinici, setAnydeinici] = useState("")
  const [userInstagram, setUserInstagram] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [mobil, setMobil] = useState("")
  const [touchedFields, setTouchedFields] = useState({
    nom: false,
    tel: false,
    web: false,
    longitud: false,
    latitud: false,
    instagram: false,
    foto: false,
    direccio: false,
    descripcio: false,
    selectedUser: false,
    responsabilitat: false,
    propietari: false,
    anydeinici: false,
  })
  const [location, navigate] = useLocation()
  const [searchTerm, setSearchTerm] = useState("")
  const [newUsersCount, setNewUsersCount] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore(app)
      const querySnapshot = await getDocs(collection(db, "users"))
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setUsers(usersData)
    }

    fetchUsers()
  }, [])

  const handleNomChange = (e) => {
    setNom(e.target.value)
  }
  const handleTelChange = (e) => {
    setTel(e.target.value)
  }
  const handleWebChange = (e) => {
    setWeb(e.target.value)
  }
  const handleLongitudChange = (e) => {
    setLongitud(e.target.value)
  }
  const handleLatitudChange = (e) => {
    setLatitud(e.target.value)
  }
  const handleInstagramChange = (e) => {
    setInstagram(e.target.value)
  }
  const handleFotosChange = (index, value) => {
    const newFotos = [...foto]
    newFotos[index] = value
    setFotos(newFotos)
  }

  const addFotoInput = () => {
    setFotos([...foto, ""])
  }

  const removeFotoInput = (index) => {
    setFotos((prevFotos) => prevFotos.filter((_, i) => i !== index))
  }

  const sortUsersByLastName = (users) => {
    return users.sort((a, b) => {
      const lastNameA = a.cognom.toLowerCase()
      const lastNameB = b.cognom.toLowerCase()
      if (lastNameA < lastNameB) return -1
      if (lastNameA > lastNameB) return 1
      return a.nom.toLowerCase().localeCompare(b.nom.toLowerCase())
    })
  }

  const sortUsers = (users) => {
    return users.sort((a, b) => {
      // Obtener el primer apellido (primera palabra después del nombre)
      const fullNameA = a.nom.split(" ")
      const fullNameB = b.nom.split(" ")

      // Asumimos que el primer apellido es la segunda palabra (índice 1)
      // Si solo hay una palabra, usamos esa
      const firstSurnameA = fullNameA.length > 1 ? fullNameA[1].toLowerCase() : fullNameA[0].toLowerCase()
      const firstSurnameB = fullNameB.length > 1 ? fullNameB[1].toLowerCase() : fullNameB[0].toLowerCase()

      // Comparar por la primera letra del primer apellido
      if (firstSurnameA[0] !== firstSurnameB[0]) {
        return firstSurnameA[0].localeCompare(firstSurnameB[0])
      }

      // Si las primeras letras son iguales, comparar el apellido completo
      return firstSurnameA.localeCompare(firstSurnameB)
    })
  }

  const groupedUsers = sortUsers(selectedUsers)

  const addNewWorker = () => {
    onOpen()
  }

  const selectUser = (userId) => {
    // Comprovar si l'usuari ja existeix al restaurant
    const userExists = selectedUsers.some((user) => user.userId === userId)

    if (userExists) {
      alert("Aquest usuari ja està afegit al restaurant.")
      onClose()
      return
    }

    const selectedUser = users.find((user) => user.id === userId)
    setSelectedUsers((prev) =>
      sortUsers([
        ...prev,
        {
          userId: userId,
          responsabilitat: "",
          propietari: false,
          anydeinici: "",
          nom: selectedUser ? `${selectedUser.nom} ${selectedUser.cognom}` : "",
          correu: selectedUser ? selectedUser.email : "",
          image: selectedUser ? selectedUser.imageUrl : "",
          instagram: selectedUser ? selectedUser.instagram : "",
          linkedin: selectedUser ? selectedUser.linkedin : "",
          mobil: selectedUser ? selectedUser.mobile : "",
        },
      ]),
    )
    setNewUsersCount((prevCount) => prevCount + 1)
    onClose()
  }

  const filteredUsers = sortUsersByLastName(
    users.filter(
      (user) =>
        `${user.nom} ${user.cognom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  )

  const removeWorker = (index) => {
    setSelectedUsers((prevUsers) => prevUsers.filter((_, i) => i !== index))
  }

  const handleDireccioChange = (e) => {
    setDireccio(e.target.value)
  }
  const handleDescripcioChange = (e) => {
    setDescripcio(e.target.value)
  }
  const handlePropietariChange = (e) => {
    setPropietari(e.target.checked)
  }
  const handleUserChange = (index, field, value) => {
    setSelectedUsers((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const handleBlur = (field) => {
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      [field]: true,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Convertir y validar longitud y latitud
    const numLongitud = Number.parseFloat(longitud)
    const numLatitud = Number.parseFloat(latitud)
    if (isNaN(numLongitud) || isNaN(numLatitud)) {
      alert("La longitud y la latitud deben ser números válidos.")
      return
    }

    // Verificación de campos requeridos
    const requiredFields = [nom, tel, web, instagram, direccio, descripcio]
    if (requiredFields.some((field) => !field) || foto.every((f) => !f)) {
      alert("Por favor, completa todos los campos obligatorios.")
      return
    }

    if (selectedUsers.some((user) => !user.userId || !user.anydeinici || !user.responsabilitat)) {
      alert("Por favor, completa todos los detalles de los treballadors.")
      return
    }

    try {
      const db = getFirestore(app)
      const newRestaurantRef = doc(collection(db, "Restaurant"))
      const restaurantData = {
        nom,
        tel,
        web,
        longitud: numLongitud,
        latitud: numLatitud,
        instagram,
        foto,
        direccio,
        descripcio,
      }

      // Guardar datos del restaurante
      await setDoc(newRestaurantRef, restaurantData)

      // Guardar datos de los treballadors
      for (const user of selectedUsers) {
        const userSnap = await getDoc(doc(db, "users", user.userId))
        if (userSnap.exists()) {
          const userData = userSnap.data()

          const alumnesRef = collection(db, "Restaurant", newRestaurantRef.id, "alumnes")

          const alumneData = {
            nom: `${userData.nom} ${userData.cognom}`,
            image: userData.imageUrl,
            correu: userData.email,
            responsabilitat: user.responsabilitat,
            propietari: user.propietari,
            anydeinici: user.anydeinici,
          }

          // Incluir campos opcionales solo si existen y no son vacíos
          if (userData.instagram) alumneData.instagram = userData.instagram
          if (userData.linkedin) alumneData.linkedin = userData.linkedin
          if (userData.mobile) alumneData.mobil = userData.mobile

          await setDoc(doc(alumnesRef), alumneData)
        }
      }

      console.log("Restaurante creado con éxito.")
      navigate("/success-restaurant")
    } catch (error) {
      console.error("Error al crear el restaurante:", error)
      alert("Error al crear el restaurante: " + error.message)
    }
  }

  return (
    <Box>
      <Box position="fixed" top="80px" left="20px" zIndex="1000">
        <Link to="/home">
          <Button colorScheme="gray">
            Tornar a l'inici
          </Button>
        </Link>
      </Box>
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
          ¡Ja podeu començar a carregar les dades dels restaurants!
        </Heading>
      </VStack>
      <VStack as="form" onSubmit={handleSubmit}>
        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Nom del restaurant</FormLabel>
          <Input
            type="text"
            value={nom}
            onChange={handleNomChange}
            onBlur={() => handleBlur("nom")}
            placeholder="Nom del restaurant"
            isInvalid={touchedFields.nom && !nom}
          />
          
          <FormHelperText mt={1} color={touchedFields.nom && !nom ? "red" : "gray"}>
            Introdueix el nom del restaurant
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Telèfon</FormLabel>
          <Input
            type="text"
            value={tel}
            onChange={handleTelChange}
            onBlur={() => handleBlur("tel")}
            placeholder="Telèfon"
            isInvalid={touchedFields.tel && !tel}
          />
          <FormHelperText mt={1} color={touchedFields.tel && !tel ? "red" : "gray"}>
            Introdueix el telèfon.
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Lloc web</FormLabel>
          <Input
            type="text"
            value={web}
            onChange={handleWebChange}
            onBlur={() => handleBlur("web")}
            placeholder="URL del lloc web"
            isInvalid={touchedFields.web && !web}
          />
          <FormHelperText mt={1} color={touchedFields.web && !web ? "red" : "gray"}>
            Introdueix la url del lloc web.
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Longitud</FormLabel>
          <Input
            type="text"
            value={longitud}
            onChange={handleLongitudChange}
            onBlur={() => handleBlur("longitud")}
            placeholder="Longitud geográfica"
            isInvalid={touchedFields.longitud && !longitud}
          />
          <FormHelperText mt={1} color={touchedFields.longitud && !longitud ? "red" : "gray"}>
            Introdueix la longitud geográfica.
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Latitud</FormLabel>
          <Input
            type="text"
            value={latitud}
            onChange={handleLatitudChange}
            onBlur={() => handleBlur("latitud")}
            placeholder="Latitud geográfica"
            isInvalid={touchedFields.latitud && !latitud}
          />
          <FormHelperText mt={1} color={touchedFields.latitud && !latitud ? "red" : "gray"}>
            Introdueix la latitud geográfica.
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Instagram</FormLabel>
          <Input
            type="text"
            value={instagram}
            onChange={handleInstagramChange}
            onBlur={() => handleBlur("instagram")}
            placeholder="Instagram"
            isInvalid={touchedFields.instagram && !instagram}
          />
          <FormHelperText mt={1} color={touchedFields.instagram && !instagram ? "red" : "gray"}>
            Introdueix l'instagram del restaurant.
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Fotos</FormLabel>
          {foto.map((url, index) => (
            <Box key={index} position="relative">
              <Input
                type="text"
                value={url}
                onChange={(e) => handleFotosChange(index, e.target.value)}
                placeholder="URL de la foto"
                onBlur={() => handleBlur("foto")}
                isInvalid={touchedFields.foto && !url}
              />

              <Button position={"absolute"} right={0} colorScheme="red" onClick={() => removeFotoInput(index)}>
                <DeleteIcon />
              </Button>
            </Box>
          ))}
          <Button onClick={() => addFotoInput()} colorScheme="blue" size="sm" m={2}>
            <AddIcon /> Afegir una altra foto
          </Button>

          <FormHelperText mt={1} color={touchedFields.foto && foto.every((f) => !f) ? "red" : "gray"}>
            Introdueix les URLs de les fotos del restaurant.
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Direcció</FormLabel>
          <Input
            type="text"
            value={direccio}
            onChange={handleDireccioChange}
            onBlur={() => handleBlur("direccio")}
            placeholder="Direcció"
            isInvalid={touchedFields.direccio && !direccio}
          />
          <FormHelperText mt={1} color={touchedFields.direccio && !direccio ? "red" : "gray"}>
            Introdueix la direcció del restaurant.
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Descripció</FormLabel>
          <Input
            type="text"
            value={descripcio}
            onChange={handleDescripcioChange}
            onBlur={() => handleBlur("descripcio")}
            placeholder="Descripció"
            isInvalid={touchedFields.descripcio && !descripcio}
          />
          <FormHelperText mt={1} color={touchedFields.descripcio && !descripcio ? "red" : "gray"}>
            Introdueix la descripció del restaurant.
          </FormHelperText>
        </FormControl>

        <FormControl mb={5} maxW={600}>
          <Box>
            <FormLabel my={7}>Treballadors</FormLabel>

            {selectedUsers.length > 0 ? (
              <Tabs width="100%" p={4}>
                <TabList mb={6} spacing={4} flexWrap="wrap">
                  {groupedUsers.map((user) => (
                    <Tab key={user.userId}>
                      {user.nom
                        ? (() => {
                            const nameParts = user.nom.split(" ")
                            // Si hay al menos nombre y un apellido
                            if (nameParts.length > 1) {
                              const firstName = nameParts[0]
                              const firstSurname = nameParts[1]
                              return `${firstSurname}, ${firstName}`
                            }
                            return user.nom
                          })()
                        : "Usuari"}
                    </Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {groupedUsers.map((user, index) => (
                    <TabPanel key={user.userId}>
                      <Text fontSize="md" fontWeight="bold" color="blue.500" mb={4}>
                        Usuaris nous afegits: {newUsersCount}
                      </Text>
                      <Box mb={6} w="100%" my={4} px={8} py={4} boxShadow={"3px 3px 8px 0 grey"} borderRadius={20}>
                        <FormControl mt={8} isRequired>
                          <FormLabel>Usuari</FormLabel>
                          <Text fontSize="lg">
                            {user.nom
                              ? (() => {
                                  const nameParts = user.nom.split(" ")
                                  // Si hay al menos nombre y un apellido
                                  if (nameParts.length > 1) {
                                    const firstName = nameParts[0]
                                    const firstSurname = nameParts[1]
                                    return `${firstSurname}, ${firstName}`
                                  }
                                  return user.nom
                                })()
                              : ""}
                          </Text>
                        </FormControl>
                        <FormControl mt={8} isRequired>
                          <FormLabel>Any de inici</FormLabel>
                          <Input
                            placeholder="Any de inici"
                            type="text"
                            value={user.anydeinici || ""}
                            onChange={(e) => handleUserChange(index, "anydeinici", e.target.value)}
                            size="lg"
                          />
                        </FormControl>
                        <FormControl mt={8} isRequired>
                          <FormLabel>Responsabilitat</FormLabel>
                          <Select
                            placeholder="Seleccionar Responsabilitat"
                            value={user.responsabilitat || ""}
                            onChange={(e) => handleUserChange(index, "responsabilitat", e.target.value)}
                            size="lg"
                          >
                            <option value="Cuiner">Cuiner</option>
                            <option value="Cambrer">Cambrer</option>
                            <option value="Gerent">Gerent</option>
                            <option value="Neteja">Neteja</option>
                            <option value="Altres">Altres</option>
                          </Select>
                        </FormControl>
                        <FormControl mt={5}>
                          <FormLabel>¿És propietari?</FormLabel>
                          <Checkbox
                            mb={10}
                            isChecked={user.propietari || false}
                            onChange={(e) => handleUserChange(index, "propietari", e.target.checked)}
                          >
                            És propietari
                          </Checkbox>
                        </FormControl>
                        <Button colorScheme="red" onClick={() => removeWorker(index)} mt={5}>
                          <DeleteIcon />
                        </Button>
                      </Box>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            ) : (
              <Text>No hi ha treballadors afegits. Feu clic al botó per afegir-ne.</Text>
            )}
          </Box>
          <Button colorScheme="blue" onClick={addNewWorker} mt={5}>
            <AddIcon /> Afegir més treballadors
          </Button>
        </FormControl>

        <Button mt={5} mb={20} colorScheme="blue" type="submit">
          Carregar dades
        </Button>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Seleccionar Treballador</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup mb={4}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Cercar treballador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Stack spacing={4} maxHeight="60vh" overflowY="auto">
              {filteredUsers.map((user) => (
                <Flex
                  key={user.id}
                  p={3}
                  borderRadius="md"
                  alignItems="center"
                  _hover={{ bg: "gray.100", cursor: "pointer" }}
                  onClick={() => selectUser(user.id)}
                >
                  <Avatar src={user.imageUrl} name={`${user.nom} ${user.cognom}`} mr={3} />
                  <Box>
                    <Text fontWeight="bold">{`${user.cognom}, ${user.nom}`}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {user.email}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Tancar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default RestaurantsForm

