<template>
  <div class="user-create">
    <h1>Créer un utilisateur</h1>

    <form @submit.prevent="submitForm">
      <input v-model="name" placeholder="Nom" required />
      <input v-model="email" placeholder="Email" type="email" required />
      <input v-model="password" placeholder="Mot de passe" type="password" required />
      <input v-model.number="age" placeholder="Âge" type="number" required />
      <button type="submit" :disabled="loading">Créer</button>
    </form>

    <p v-if="errorMessage" class="error">Erreur : {{ errorMessage }}</p>
    <p v-if="userCreated">✅ Utilisateur créé : {{ userCreated.name }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'

// Définition de la mutation GraphQL
const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      user {
        id
        name
        email
        age
      }
      token
    }
  }
`

// Champs du formulaire
const name = ref('')
const email = ref('')
const password = ref('')
const age = ref<number | null>(null)

// Mutation Apollo
const { mutate, loading } = useMutation(CREATE_USER)

// Résultat et erreurs
const userCreated = ref<any>(null)
const errorMessage = ref('')

// Fonction de soumission du formulaire
const submitForm = async () => {
  errorMessage.value = ''
  userCreated.value = null

  try {
    const res = await mutate({
      input: {
        name: name.value,
        email: email.value,
        password: password.value,
        age: age.value,
      },
    })

    if (res?.data?.createUser?.user) {
      userCreated.value = res.data.createUser.user
    } else {
      errorMessage.value = 'La création a échoué.'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Erreur inconnue.'
    console.error('Erreur mutation :', err)
  }
}
</script>

<style scoped>
.user-create {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}

input {
  padding: 0.5rem;
  font-size: 1rem;
}

button {
  padding: 0.5rem;
  background: #2e8bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: red;
}
</style>
