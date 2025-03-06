"use client"

import { useState, useEffect } from "react"
import { useRoute, useLocation } from "wouter"
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Tabs,
  VStack,
  Checkbox,
  Heading,
  useToast,
  Select,
  Text,
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
} from "@chakra-ui/react"
import { doc, getFirestore, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore"
import { app } from "../../firebaseConfig"
import { DeleteIcon, SearchIcon } from "@chakra-ui/icons"

const EditRestaurantForm = () => {
  const [, params] = useRoute("/edit-restaurant/:id")
  const restaurantId = params.id
  const [location, navigate] = useLocation()
  const toast = useToast()
  const [restaurant, setRestaurant] = useState({
    nom: "",
    tel: "",
    web: "",
    longitud: "",
    latitud: "",
    instagram: "",
    foto: [""],
    direccio: "",
    descripcio: "",
    users: [],
  })
  const [allUsers, setAllUsers] = useState([])
  const [userImages, setUserImages] = useState({})
  const [addingNewUser, setAddingNewUser] = useState(false)
  const [deletedUsers, setDeletedUsers] = useState([])
  const [newUsersCount, setNewUsersCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const db = getFirestore(app)

    const fetchAllUsers = async () => {
      try {
        const usersCollectionRef = collection(db, "users")
        const userSnapshots = await getDocs(usersCollectionRef)
        const usersData = userSnapshots.docs.map((doc) => ({
          id: doc.id,
          nom: doc.data().nom,
          cognom: doc.data().cognom,
          imageUrl: doc.data().imageUrl,
          email: doc.data().email,
          instagram: doc.data().instagram,
          linkedin: doc.data().linkedin,
          mobile: doc.data().mobile,
        }))
        setAllUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "No se pudieron obtener los usuarios.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    }

    const fetchRestaurantData = async () => {
      try {
        const restaurantDocRef = doc(db, "Restaurant", restaurantId)
        const docSnap = await getDoc(restaurantDocRef)
        if (docSnap.exists()) {
          const data = docSnap.data()

          // Fetch the "alumnes" subcollection
          const alumnesCollectionRef = collection(restaurantDocRef, "alumnes")
          const alumnesSnapshot = await getDocs(alumnesCollectionRef)
          const alumnesData = alumnesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          setRestaurant({
            ...data,
            users: alumnesData,
          })

          console.log("Alumnes data: ", alumnesData)
          await fetchAllUsers()
          // Fetch user images
          const userIds = alumnesData.map((alumne) => alumne.userId)
          const imagePromises = userIds.map(async (userId) => {
            if (userId) {
              const userDocRef = doc(db, "users", userId)
              const userDoc = await getDoc(userDocRef)
              if (userDoc.exists()) {
                return { [userId]: userDoc.data().imageUrl }
              }
            }
            return { [userId]: null }
          })
          const images = await Promise.all(imagePromises)
          const imagesMap = images.reduce((acc, img) => ({ ...acc, ...img }), {})
          setUserImages(imagesMap)
        } else {
          toast({
            title: "Error",
            description: "No se encontró el restaurante.",
            status: "error",
            duration: 5000,
            isClosable: true,
          })
          navigate("/home")
        }
      } catch (error) {
        console.error("Error carregant dades del restaurant:", error)
        toast({
          title: "Error",
          description: "Error en carregar les dades del restaurant.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    }

    fetchRestaurantData()
  }, [restaurantId, navigate, toast])

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

  const groupedUsers = sortUsers(restaurant.users)

  const handleChange = (e) => {
    const { name, value } = e.target
    setRestaurant((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFotosChange = (index, value) => {
    const newFotos = [...restaurant.foto]
    newFotos[index] = value
    setRestaurant((prev) => ({ ...prev, foto: newFotos }))
  }

  const addFotoInput = () => {
    setRestaurant((prev) => ({ ...prev, foto: [...prev.foto, ""] }))
  }

  const removeFotoInput = (index) => {
    const filteredFotos = restaurant.foto.filter((_, i) => i !== index)
    setRestaurant((prev) => ({ ...prev, foto: filteredFotos }))
  }

  const handleUserChange = (index, field, value) => {
    const updatedUsers = [...restaurant.users]

    // Assegurem-nos que l'índex és vàlid
    if (index >= 0 && index < updatedUsers.length) {
      updatedUsers[index] = { ...updatedUsers[index], [field]: value }

      // Update the selected user details from the allUsers array
      if (field === "userId") {
        const selectedUser = allUsers.find((user) => user.id === value)
        if (selectedUser) {
          updatedUsers[index] = {
            ...updatedUsers[index],
            nom: `${selectedUser.nom} ${selectedUser.cognom}`,
            correu: selectedUser.email,
            image: selectedUser.imageUrl,
            instagram: selectedUser.instagram,
            linkedin: selectedUser.linkedin,
            mobil: selectedUser.mobile,
          }
        }
      }

      setRestaurant((prev) => ({
        ...prev,
        users: updatedUsers,
      }))
    } else {
      console.error("Índex d'usuari no vàlid:", index)
    }
  }

  const addUser = () => {
    onOpen()
  }

  const removeUser = (userIndex) => {
    const userToDelete = restaurant.users[userIndex]

    if (userToDelete.id) {
      setDeletedUsers((prev) => [...prev, userToDelete.id])
    }

    setRestaurant((prev) => ({
      ...prev,
      users: prev.users.filter((_, i) => i !== userIndex),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const db = getFirestore(app)
    const restaurantDocRef = doc(db, "Restaurant", restaurantId)

    try {
      await setDoc(
        restaurantDocRef,
        {
          nom: restaurant.nom,
          tel: restaurant.tel,
          web: restaurant.web,
          longitud: restaurant.longitud,
          latitud: restaurant.latitud,
          instagram: restaurant.instagram,
          foto: restaurant.foto,
          direccio: restaurant.direccio,
          descripcio: restaurant.descripcio,
        },
        { merge: true },
      )

      // Delete users from the "alumnes" subcollection
      const alumnesCollectionRef = collection(restaurantDocRef, "alumnes")
      for (const userId of deletedUsers) {
        const userDocRef = doc(alumnesCollectionRef, userId)
        await deleteDoc(userDocRef)
      }

      // Update the "alumnes" subcollection
      for (const user of restaurant.users) {
        const userDocRef = user.id ? doc(alumnesCollectionRef, user.id) : doc(alumnesCollectionRef)
        await setDoc(userDocRef, user, { merge: true })
      }

      setDeletedUsers([]) // Reset deletedUsers after successful update

      toast({
        title: "Restaurante Actualizado",
        description: "Los datos del restaurante se han actualizado correctamente.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
      setAddingNewUser(false)
      navigate("/veure-restaurants")
    } catch (error) {
      console.error("Error actualizando el restaurante:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el restaurante.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const selectUser = (userId) => {
    // Comprovar si l'usuari ja existeix al restaurant
    const userExists = restaurant.users.some((user) => user.userId === userId)

    if (userExists) {
      toast({
        title: "Usuari ja afegit",
        description: "Aquest usuari ja està afegit al restaurant.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      })
      onClose()
      return
    }

    const selectedUser = allUsers.find((user) => user.id === userId)
    setRestaurant((prev) => ({
      ...prev,
      users: sortUsers([
        ...prev.users,
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
    }))
    setAddingNewUser(false)
    setNewUsersCount((prevCount) => prevCount + 1)
    onClose()
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

  const filteredUsers = sortUsersByLastName(
    allUsers.filter(
      (user) =>
        `${user.nom} ${user.cognom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  )

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
          ¡Editeu els dades dels restaurants!
        </Heading>
      </VStack>
      <VStack as="form" onSubmit={handleSubmit} spacing={5} maxW={800} mx="auto">
        <FormControl isRequired>
          <FormLabel>Nom del restaurant</FormLabel>
          <Input name="nom" value={restaurant.nom} onChange={handleChange} placeholder="Nom del restaurant" />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Telèfon</FormLabel>
          <Input name="tel" value={restaurant.tel} onChange={handleChange} placeholder="Telèfon del restaurant" />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Lloc web</FormLabel>
          <Input name="web" value={restaurant.web} onChange={handleChange} placeholder="URL del lloc web" />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Longitud</FormLabel>
          <Input
            name="longitud"
            value={restaurant.longitud}
            onChange={handleChange}
            placeholder="Longitud geográfica"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Latitud</FormLabel>
          <Input name="latitud" value={restaurant.latitud} onChange={handleChange} placeholder="Latitud geográfica" />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Instagram</FormLabel>
          <Input
            name="instagram"
            value={restaurant.instagram}
            onChange={handleChange}
            placeholder="Instagram del restaurant"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Fotos</FormLabel>
          {restaurant.foto.map((url, index) => (
            <Box key={index} display="flex" alignItems="center" mb={2}>
              <Input
                value={url}
                onChange={(e) => handleFotosChange(index, e.target.value)}
                placeholder="URL de la foto"
              />
              <Button colorScheme="red" onClick={() => removeFotoInput(index)} ml={2}>
                <DeleteIcon />
              </Button>
            </Box>
          ))}
          <Button onClick={addFotoInput} colorScheme="blue" mt={2}>
            Afegir una altra foto
          </Button>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Direcció</FormLabel>
          <Input
            name="direccio"
            value={restaurant.direccio}
            onChange={handleChange}
            placeholder="Direcció del restaurant"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Descripció</FormLabel>
          <Input
            name="descripcio"
            value={restaurant.descripcio}
            onChange={handleChange}
            placeholder="Descripció del restaurant"
          />
        </FormControl>

        <FormControl mt={10}>
          <FormLabel>Treballadors</FormLabel>
        </FormControl>

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
                  <Button colorScheme="red" onClick={() => removeUser(index)} mt={5}>
                    <DeleteIcon />
                  </Button>
                </Box>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>

        <Button onClick={addUser} colorScheme="blue" mt={5}>
          Afegir més treballadors
        </Button>

        <Button mt={5} mb={20} colorScheme="blue" type="submit">
          Guardar Canvis
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

export default EditRestaurantForm

