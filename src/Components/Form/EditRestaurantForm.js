"use client"

import { useState, useEffect, useRef } from "react"
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
  Badge,
  Alert,
  AlertIcon,
  FormErrorMessage,
} from "@chakra-ui/react"
import { doc, getFirestore, getDoc, setDoc, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore"
import { app } from "../../firebaseConfig"
import { DeleteIcon, SearchIcon } from "@chakra-ui/icons"
import Sidebar from "../Sidebar" // Import the Sidebar component

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [usersWithMissingIds, setUsersWithMissingIds] = useState([])

  // Estados para validación de trabajadores
  const [touchedFields, setTouchedFields] = useState({})
  const [validationErrors, setValidationErrors] = useState({})
  const [tabIndex, setTabIndex] = useState(0)
  const previousTabIndex = useRef(0)

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
          segonCognom: doc.data().segonCognom,
        }))
        setAllUsers(usersData)
        return usersData
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "No s'han pogut obtenir els usuaris.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
        return []
      }
    }

    const fetchRestaurantData = async () => {
      setLoadingUsers(true)
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

          // Obtener todos los usuarios para poder buscar por nombre si falta userId
          const allUsersData = await fetchAllUsers()

          // Verificar y corregir usuarios sin userId
          const missingIds = []
          const updatedAlumnesData = await Promise.all(
            alumnesData.map(async (alumne) => {
              // Si no tiene userId pero tiene nombre, intentamos encontrarlo
              if (!alumne.userId && alumne.nom) {
                console.log(`Usuario sin userId encontrado: ${alumne.nom}, intentando buscar por nombre...`)

                // Buscar usuario por nombre
                const matchingUser = allUsersData.find(
                  (user) => `${user.nom} ${user.cognom}`.toLowerCase() === alumne.nom.toLowerCase(),
                )

                if (matchingUser) {
                  console.log(`Usuario encontrado por nombre: ${matchingUser.id}`)

                  // Actualizar el documento en Firebase con el userId encontrado
                  const alumneRef = doc(restaurantDocRef, "alumnes", alumne.id)
                  await updateDoc(alumneRef, { userId: matchingUser.id })

                  return {
                    ...alumne,
                    userId: matchingUser.id,
                    userIdFixed: true, // Marcar que se ha corregido
                  }
                } else {
                  missingIds.push(alumne)
                  return alumne
                }
              }
              return alumne
            }),
          )

          setUsersWithMissingIds(missingIds)

          setRestaurant({
            ...data,
            users: updatedAlumnesData,
          })

          console.log("Alumnes data actualizada:", updatedAlumnesData)

          // Fetch user images
          const userIds = updatedAlumnesData.map((alumne) => alumne.userId).filter(Boolean)
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
            description: "No s'ha trobat el restaurant.",
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
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchRestaurantData()
  }, [restaurantId, navigate, toast])

  const sortUsers = (users) => {
    return users.sort((a, b) => {
      // Usar directamente el campo cognom si existe
      const cognomA = a?.cognom || ""
      const cognomB = b?.cognom || ""

      // Comparar por apellido primero
      if (cognomA.toLowerCase() !== cognomB.toLowerCase()) {
        return cognomA.toLowerCase().localeCompare(cognomB.toLowerCase())
      }

      // Si los apellidos son iguales, comparar por nombre
      const nomA = a?.nom || ""
      const nomB = b?.nom || ""
      return nomA.toLowerCase().localeCompare(nomB.toLowerCase())
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

  // Función para validar un campo específico de un usuario
  const validateUserField = (user, field) => {
    if (field === "anydeinici" && !user.anydeinici) {
      return "L'any d'inici és obligatori"
    }
    if (field === "responsabilitat" && !user.responsabilitat) {
      return "La responsabilitat és obligatòria"
    }
    return ""
  }

  // Función para validar todos los campos de un usuario
  const validateUser = (user, index) => {
    const errors = {}

    if (!user.anydeinici) {
      errors[`user-${index}-anydeinici`] = "L'any d'inici és obligatori"
    }

    if (!user.responsabilitat) {
      errors[`user-${index}-responsabilitat`] = "La responsabilitat és obligatòria"
    }

    return errors
  }

  // Función para validar todos los usuarios
  const validateAllUsers = () => {
    let allErrors = {}
    let hasErrors = false

    restaurant.users.forEach((user, index) => {
      const userErrors = validateUser(user, index)
      if (Object.keys(userErrors).length > 0) {
        hasErrors = true
        allErrors = { ...allErrors, ...userErrors }
      }
    })

    setValidationErrors(allErrors)
    return !hasErrors
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
            nom: selectedUser.nom,
            cognom: selectedUser.cognom,
            segonCognom: selectedUser.segonCognom,
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

      // Validar el campo después de cambiarlo
      const fieldId = `user-${index}-${field}`
      setTouchedFields((prev) => ({ ...prev, [fieldId]: true }))

      const error = validateUserField(updatedUsers[index], field)
      setValidationErrors((prev) => ({
        ...prev,
        [fieldId]: error,
      }))
    } else {
      console.error("Índex d'usuari no vàlid:", index)
    }
  }

  // Función para marcar un campo como tocado
  const handleBlur = (index, field) => {
    const fieldId = `user-${index}-${field}`
    setTouchedFields((prev) => ({ ...prev, [fieldId]: true }))

    // Validar el campo cuando pierde el foco
    const user = restaurant.users[index]
    const error = validateUserField(user, field)
    setValidationErrors((prev) => ({
      ...prev,
      [fieldId]: error,
    }))
  }

  // Función para verificar si un usuario tiene campos incompletos
  const hasIncompleteFields = (user) => {
    return !user.anydeinici || !user.responsabilitat
  }

  // Función para asignar manualmente un userId a un usuario existente
  const assignUserId = (userIndex, userId) => {
    const updatedUsers = [...restaurant.users]
    const selectedUser = allUsers.find((user) => user.id === userId)

    if (selectedUser && userIndex >= 0 && userIndex < updatedUsers.length) {
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        userId: userId,
        nom: selectedUser.nom,
        cognom: selectedUser.cognom,
        segonCognom: selectedUser.segonCognom,
        correu: selectedUser.email,
        image: selectedUser.imageUrl,
        instagram: selectedUser.instagram,
        linkedin: selectedUser.linkedin,
        mobil: selectedUser.mobile,
      }

      setRestaurant((prev) => ({
        ...prev,
        users: updatedUsers,
      }))

      // Actualizar inmediatamente en Firebase
      const db = getFirestore(app)
      const restaurantDocRef = doc(db, "Restaurant", restaurantId)
      const userDocRef = doc(restaurantDocRef, "alumnes", updatedUsers[userIndex].id)

      updateDoc(userDocRef, {
        userId: userId,
        nom: selectedUser.nom,
        cognom: selectedUser.cognom,
        segonCognom: selectedUser.segonCognom || "",
      })
        .then(() => {
          toast({
            title: "Usuari actualitzat",
            status: "success",
            duration: 3000,
            isClosable: true,
          })

          // Eliminar de la lista de usuarios con IDs faltantes
          setUsersWithMissingIds((prev) => prev.filter((u) => u.id !== updatedUsers[userIndex].id))
        })
        .catch((error) => {
          console.error("Error al actualizar el userId:", error)
          toast({
            title: "Error",
            description: "No s'ha pogut actualitzat l'ID de l'usuari.",
            status: "error",
            duration: 5000,
            isClosable: true,
          })
        })
    }
  }

  const addUser = () => {
    onOpen()
  }

  const removeUser = (userIndex) => {
    if (window.confirm("Segur que vols eliminar aquest treballador?")) {
      const userToDelete = restaurant.users[userIndex]

      if (userToDelete.id) {
        setDeletedUsers((prev) => [...prev, userToDelete])
      }

      setRestaurant((prev) => ({
        ...prev,
        users: prev.users.filter((_, i) => i !== userIndex),
      }))

      toast({
        title: "Treballador eliminat",
        description: "El treballador s'ha eliminat correctament.",
        status: "info",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Función para manejar el cambio de pestaña
  const handleTabChange = (index) => {
    // Verificar si el usuario actual tiene campos incompletos
    const currentUser = restaurant.users[previousTabIndex.current]
    if (currentUser && hasIncompleteFields(currentUser)) {
      // Usar window.alert en lugar de toast para asegurar que sea visible
      window.alert(
        `ATENCIÓ! El treballador ${formatUserName(currentUser)} té camps obligatoris sense completar. Si us plau, ompliu tots els camps marcats amb * abans de canviar de pestanya.`,
      )

      // Resaltar los campos incompletos
      const userIndex = previousTabIndex.current
      setTouchedFields((prev) => ({
        ...prev,
        [`user-${userIndex}-anydeinici`]: true,
        [`user-${userIndex}-responsabilitat`]: true,
      }))

      // Permitir el cambio de pestaña después de mostrar la alerta
      setTabIndex(index)
    } else {
      // Si no hay campos incompletos, permitir el cambio
      setTabIndex(index)
    }

    // Actualizar el índice anterior
    previousTabIndex.current = index
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar todos los campos de los usuarios
    const isValid = validateAllUsers()

    if (!isValid) {
      // Marcar todos los campos como tocados para mostrar los errores
      const touchedFieldsObj = {}
      restaurant.users.forEach((user, index) => {
        touchedFieldsObj[`user-${index}-anydeinici`] = true
        touchedFieldsObj[`user-${index}-responsabilitat`] = true
      })
      setTouchedFields((prev) => ({ ...prev, ...touchedFieldsObj }))

      // Mostrar alerta con los trabajadores que tienen campos incompletos
      const incompleteUsers = restaurant.users.filter(hasIncompleteFields).map(formatUserName).join(", ")

      toast({
        title: "Error de validació",
        description: `Si us plau, completeu tots els camps obligatoris dels següents treballadors: ${incompleteUsers}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    // Verificar si hay usuarios sin userId
    const usersWithoutId = restaurant.users.filter((user) => !user.userId)
    if (usersWithoutId.length > 0) {
      const confirmContinue = window.confirm(
        `Hi ha ${usersWithoutId.length} usuari(s) sense ID assignat. Aquests usuaris no s'actualitzaran correctament. Voleu continuar igualment?`,
      )
      if (!confirmContinue) return
    }

    setIsSubmitting(true)
    const db = getFirestore(app)
    const restaurantDocRef = doc(db, "Restaurant", restaurantId)

    try {
      // 1. Update the main restaurant document
      const restaurantData = {
        nom: restaurant.nom,
        tel: restaurant.tel,
        web: restaurant.web,
        longitud: restaurant.longitud,
        latitud: restaurant.latitud,
        instagram: restaurant.instagram,
        foto: restaurant.foto.filter((url) => url.trim() !== ""),
        direccio: restaurant.direccio,
        descripcio: restaurant.descripcio,
      }

      await updateDoc(restaurantDocRef, restaurantData)

      // 2. Delete removed users from the subcollection
      for (const deletedUser of deletedUsers) {
        if (deletedUser && deletedUser.id) {
          await deleteDoc(doc(restaurantDocRef, "alumnes", deletedUser.id))

          // Si era propietario y tiene userId, actualizar su perfil
          if (deletedUser.propietari && deletedUser.userId) {
            const userRef = doc(db, "users", deletedUser.userId)
            const userDoc = await getDoc(userRef)

            if (userDoc.exists() && userDoc.data().propietari) {
              const propietariArray = userDoc.data().propietari || []
              // Filtrar el restaurante actual del array
              const updatedArray = propietariArray.filter((rest) => rest && rest.id !== restaurantId)

              // Actualizar el documento del usuario
              await updateDoc(userRef, { propietari: updatedArray })
              console.log(`Restaurante eliminado del array de propietario para usuario ${deletedUser.userId}`)
            }
          }
        }
      }

      // 3. Update or add users in the subcollection
      for (const user of restaurant.users) {
        // Verificar que el usuario tenga un userId válido
        if (!user.userId) {
          console.warn("Usuario sin userId encontrado, saltando actualización de propietario...", user)
          // Aún así actualizamos otros campos en la subcolección
          if (user.id) {
            const userDocRef = doc(restaurantDocRef, "alumnes", user.id)
            const userData = {
              nom: user.nom || "",
              responsabilitat: user.responsabilitat || "",
              propietari: Boolean(user.propietari),
              anydeinici: user.anydeinici || "",
              instagram: user.instagram || "",
              linkedin: user.linkedin || "",
              mobil: user.mobil || "",
            }
            await updateDoc(userDocRef, userData)
            console.log(`Actualizado usuario sin userId: ${user.id}`)
          }
          continue
        }

        // Determine if this is a new user or an existing one
        const isNewUser = !user.id || user.id.startsWith("new-")

        // Para usuarios nuevos, creamos un nuevo documento con ID generado por Firebase
        // Para usuarios existentes, usamos su ID actual
        const userDocRef = isNewUser
          ? doc(collection(restaurantDocRef, "alumnes"))
          : doc(restaurantDocRef, "alumnes", user.id)

        // Prepare user data - asegurarse de que todos los campos estén definidos
        const userData = {
          userId: user.userId,
          nom: user.nom || "",
          cognom: user.cognom || "",
          responsabilitat: user.responsabilitat || "",
          propietari: Boolean(user.propietari),
          anydeinici: user.anydeinici || "",
          instagram: user.instagram || "",
          linkedin: user.linkedin || "",
          mobil: user.mobil || "",
          segonCognom: user.segonCognom || "",
        }

        // Save user data
        if (isNewUser) {
          await setDoc(userDocRef, userData)
          console.log(`Nuevo usuario creado con userId: ${user.userId}`)
        } else {
          await updateDoc(userDocRef, userData)
          console.log(`Usuario existente actualizado con userId: ${user.userId}`)
        }

        // Si el usuario es propietario, actualizar su documento en la colección users
        if (user.propietari) {
          const userRef = doc(db, "users", user.userId)
          const userDoc = await getDoc(userRef)

          if (userDoc.exists()) {
            // Información del restaurante
            const restaurantInfo = {
              id: restaurantId,
              nom: restaurant.nom,
              direccio: restaurant.direccio,
            }

            // Obtener el array de propietari actual o crear uno nuevo
            const userData = userDoc.data()
            const propietariArray = Array.isArray(userData.propietari) ? [...userData.propietari] : []

            // Verificar si este restaurante ya está en el array
            const restaurantIndex = propietariArray.findIndex((rest) => rest && rest.id === restaurantId)

            if (restaurantIndex === -1) {
              // Añadir el restaurante si no existe
              propietariArray.push(restaurantInfo)
              console.log(`Restaurante añadido al array de propietario para usuario ${user.userId}`)
            } else {
              // Actualizar la información del restaurante si ya existe
              propietariArray[restaurantIndex] = restaurantInfo
              console.log(`Información de restaurante actualizada en array de propietario para usuario ${user.userId}`)
            }

            // Actualizar el documento del usuario
            await updateDoc(userRef, { propietari: propietariArray })
          }
        } else {
          // Si el usuario no es propietario pero podría haberlo sido antes,
          // verificar y eliminar el restaurante de su array propietari
          const userRef = doc(db, "users", user.userId)
          const userDoc = await getDoc(userRef)

          if (userDoc.exists() && userDoc.data().propietari) {
            const userData = userDoc.data()
            const propietariArray = Array.isArray(userData.propietari) ? [...userData.propietari] : []

            // Si el restaurante está en el array, eliminarlo
            const restaurantIndex = propietariArray.findIndex((rest) => rest && rest.id === restaurantId)
            if (restaurantIndex !== -1) {
              propietariArray.splice(restaurantIndex, 1)
              await updateDoc(userRef, { propietari: propietariArray })
              console.log(`Restaurante eliminado del array de propietario para usuario ${user.userId}`)
            }
          }
        }
      }

      toast({
        title: "Restaurant actualitzat",
        description: "Les dades del restaurant han estat actualitzades amb èxit.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      setDeletedUsers([]) // Reset deletedUsers after successful update
      navigate("/veure-restaurants")
    } catch (error) {
      console.error("Error actualitzant el restaurant:", error)
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar el restaurant.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
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
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "No s'ha pogut trobar l'usuari seleccionat.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      onClose()
      return
    }

    setRestaurant((prev) => ({
      ...prev,
      users: sortUsers([
        ...prev.users,
        {
          id: `new-${Date.now()}`, // Temporal ID for new users
          userId: userId,
          responsabilitat: "",
          propietari: false,
          anydeinici: "",
          nom: selectedUser ? selectedUser.nom : "",
          cognom: selectedUser ? selectedUser.cognom : "",
          segonCognom: selectedUser ? selectedUser.segonCognom : "",
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
      const lastNameA = (a?.cognom || "").toLowerCase()
      const lastNameB = (b?.cognom || "").toLowerCase()

      if (lastNameA < lastNameB) return -1
      if (lastNameA > lastNameB) return 1

      const firstNameA = (a?.nom || "").toLowerCase()
      const firstNameB = (b?.nom || "").toLowerCase()
      return firstNameA.localeCompare(firstNameB)
    })
  }

  const filteredUsers = sortUsersByLastName(
    allUsers.filter(
      (user) =>
        `${user.nom} ${user.cognom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  )

  // Función para formatear el nombre en el formato "Apellido, Nombre completo"
  const formatUserName = (user) => {
    if (user.cognom) {
      // Si tiene cognom, usar el formato "Apellido, Nombre"
      const secondLastName = user.segonCognom ? ` ${user.segonCognom}` : ""
      return `${user.cognom}${secondLastName}, ${user.nom}`
    } else if (user.nom) {
      // Si no tiene cognom pero tiene nom, intentar extraer el apellido del nombre completo
      const fullName = user.nom
      const nameParts = fullName.split(" ")

      // Si hay al menos dos partes, asumir que la última es el apellido
      if (nameParts.length > 1) {
        const lastName = nameParts.pop() // Extraer el último elemento como apellido
        const firstName = nameParts.join(" ") // El resto es el nombre
        return `${lastName}, ${firstName}`
      }

      // Si solo hay una parte, mostrarla tal cual
      return fullName
    }

    return "Usuari"
  }

  // The form content that will be wrapped by the Sidebar
  const formContent = (
    <Box>
      {/* Remove the "Back to home" button since the sidebar already has navigation */}
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
          Editeu les dades dels restaurants!
        </Heading>
      </VStack>

      {usersWithMissingIds.length > 0 && (
        <Alert status="warning" mb={5}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">S'han trobat {usersWithMissingIds.length} usuari(s) sense ID assignat</Text>
            <Text>
              Aquests usuaris necessiten tenir un ID assignat per poder actualitzar el seu estat de propietari
              correctament. Si us plau, assigneu un ID a cada usuari a la seva pestanya corresponent.
            </Text>
          </Box>
        </Alert>
      )}

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

        {loadingUsers ? (
          <Text>Carregant usuaris...</Text>
        ) : (
          <Tabs width="100%" p={4} index={tabIndex} onChange={handleTabChange}>
            <TabList mb={6} spacing={4} flexWrap="wrap">
              {groupedUsers.map((user, idx) => (
                <Tab
                  key={user.id || `new-user-${idx}`}
                  _selected={
                    hasIncompleteFields(user) ? { color: "red.500", borderColor: "red.500", fontWeight: "bold" } : {}
                  }
                  color={hasIncompleteFields(user) ? "red.500" : "inherit"}
                  fontWeight={hasIncompleteFields(user) ? "bold" : "normal"}
                >
                  {formatUserName(user)}
                  {!user.userId && (
                    <Badge ml={2} colorScheme="red">
                      Sense ID
                    </Badge>
                  )}
                  {user.userIdFixed && (
                    <Badge ml={2} colorScheme="green">
                      ID Corregit
                    </Badge>
                  )}
                  {hasIncompleteFields(user) && (
                    <Badge ml={2} colorScheme="red" fontWeight="bold">
                      INCOMPLET!
                    </Badge>
                  )}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {groupedUsers.map((user, index) => (
                <TabPanel key={user.id || `new-user-panel-${index}`}>
                  <Text fontSize="md" fontWeight="bold" color="blue.500" mb={4}>
                    Usuaris nous afegits: {newUsersCount}
                  </Text>
                  <Box mb={6} w="100%" my={4} px={8} py={4} boxShadow={"3px 3px 8px 0 grey"} borderRadius={20}>
                    <FormControl mt={8} isRequired>
                      <FormLabel>Usuari</FormLabel>
                      <Text fontSize="lg">{formatUserName(user)}</Text>
                    </FormControl>

                    <FormControl mt={4}>
                      <FormLabel>ID d'Usuari</FormLabel>
                      {user.userId ? (
                        <Text fontSize="sm" fontFamily="monospace" bg="gray.100" p={2} borderRadius="md">
                          {user.userId}
                        </Text>
                      ) : (
                        <Box>
                          <Alert status="error" mb={2}>
                            <AlertIcon />
                            <Text>
                              Aquest usuari no té un ID assignat i no es podrà actualitzar correctament el seu estat de
                              propietari.
                            </Text>
                          </Alert>
                          <Text mb={2}>Seleccioneu un usuari per assignar el seu ID:</Text>
                          <Select
                            placeholder="Seleccionar usuari"
                            onChange={(e) => assignUserId(index, e.target.value)}
                          >
                            {filteredUsers.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.cognom}, {u.nom} ({u.email})
                              </option>
                            ))}
                          </Select>
                        </Box>
                      )}
                    </FormControl>

                    <FormControl
                      mt={8}
                      isRequired
                      isInvalid={
                        touchedFields[`user-${index}-anydeinici`] && validationErrors[`user-${index}-anydeinici`]
                      }
                    >
                      <FormLabel>Any d'inici</FormLabel>
                      <Input
                        placeholder="Any d'inici"
                        type="text"
                        value={user.anydeinici || ""}
                        onChange={(e) => handleUserChange(index, "anydeinici", e.target.value)}
                        onBlur={() => handleBlur(index, "anydeinici")}
                        size="lg"
                      />
                      <FormErrorMessage>{validationErrors[`user-${index}-anydeinici`]}</FormErrorMessage>
                    </FormControl>

                    <FormControl
                      mt={8}
                      isRequired
                      isInvalid={
                        touchedFields[`user-${index}-responsabilitat`] &&
                        validationErrors[`user-${index}-responsabilitat`]
                      }
                    >
                      <FormLabel>Responsabilitat</FormLabel>
                      <Select
                        placeholder="Seleccionar Responsabilitat"
                        value={user.responsabilitat || ""}
                        onChange={(e) => handleUserChange(index, "responsabilitat", e.target.value)}
                        onBlur={() => handleBlur(index, "responsabilitat")}
                        size="lg"
                      >
                        <option value="Cuiner">Cuiner</option>
                        <option value="Cambrer">Cambrer</option>
                        <option value="Gerent">Gerent</option>
                        <option value="Neteja">Neteja</option>
                        <option value="Altres">Altres</option>
                      </Select>
                      <FormErrorMessage>{validationErrors[`user-${index}-responsabilitat`]}</FormErrorMessage>
                    </FormControl>

                    <FormControl mt={5}>
                      <FormLabel>És propietari?</FormLabel>
                      <Checkbox
                        mb={10}
                        isChecked={user.propietari || false}
                        onChange={(e) => handleUserChange(index, "propietari", e.target.checked)}
                        isDisabled={!user.userId}
                      >
                        És propietari
                      </Checkbox>
                      {!user.userId && (
                        <Text fontSize="sm" color="red.500" mt={-8} mb={8}>
                          Cal assignar un ID d'usuari per poder marcar com a propietari
                        </Text>
                      )}
                    </FormControl>

                    {hasIncompleteFields(user) && (
                      <Alert status="warning" mb={4}>
                        <AlertIcon />
                        <Text>
                          Aquest treballador té camps obligatoris sense completar. Si us plau, ompliu tots els camps
                          marcats amb *.
                        </Text>
                      </Alert>
                    )}

                    <Button colorScheme="red" onClick={() => removeUser(index)} mt={5}>
                      <DeleteIcon />
                    </Button>
                  </Box>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        )}

        <Button onClick={addUser} colorScheme="blue" mt={5}>
          Afegir més treballadors
        </Button>

        <Button
          mt={5}
          mb={20}
          colorScheme="blue"
          type="submit"
          isLoading={isSubmitting}
          loadingText="Guardant..."
          isDisabled={loadingUsers}
        >
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
                    <Text fontWeight="bold">{`${user.cognom}${user.segonCognom ? ` ${user.segonCognom}` : ""}, ${user.nom}`}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {user.email}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      ID: {user.id}
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

  // Wrap the form content with the Sidebar component
  return <Sidebar>{formContent}</Sidebar>
}

export default EditRestaurantForm
