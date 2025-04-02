<template>
  <div class="about">
    <h1>Utilisateurs</h1>
    <div v-if="loading">Chargement...</div>
    <div v-else-if="error">Erreur : {{ error.message }}</div>
    <ul v-else>
      <li v-for="edge in users" :key="edge.node.id">
        {{ edge.node.name }}
      </li>
    </ul>

    <button v-if="pageInfo?.hasNextPage && !loadingMore" @click="loadMore" class="load-more">
      Charger plus
    </button>
    <div v-if="loadingMore">Chargement en cours...</div>
  </div>
</template>

<script setup lang="ts">
import { gql } from '@apollo/client/core'
import { useQuery } from '@vue/apollo-composable'
import { ref, watchEffect } from 'vue'

const USERS_QUERY = gql`
  query AllUsers($first: Int!, $after: String) {
    allUsers(first: $first, after: $after) {
      edges {
        node {
          id
          name
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const FIRST = 2

const { result, loading, error, fetchMore } = useQuery(
  USERS_QUERY,
  {
    first: FIRST,
  },
  {
    pollInterval: 5000000, // refresh auto
  },
)

const users = ref<any[]>([])
const pageInfo = ref({
  hasNextPage: false,
  endCursor: null,
})
const loadingMore = ref(false)

watchEffect(() => {
  if (result.value?.allUsers) {
    users.value = [...result.value.allUsers.edges]
    pageInfo.value = result.value.allUsers.pageInfo
  }
})

const loadMore = async () => {
  if (!pageInfo.value.hasNextPage) return

  loadingMore.value = true

  try {
    const res = await fetchMore({
      variables: {
        first: FIRST,
        after: pageInfo.value.endCursor,
      },
    })

    if (!res || !res.data?.allUsers) {
      throw new Error('fetchMore returned no data')
    }

    const newEdges = res.data.allUsers.edges
    const newPageInfo = res.data.allUsers.pageInfo

    users.value.push(...newEdges)
    pageInfo.value = newPageInfo
  } catch (e) {
    console.error('Erreur lors du fetchMore :', e)
  } finally {
    loadingMore.value = false
  }
}
</script>

<style scoped>
.about {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: start;
}

.load-more {
  padding: 0.5rem 1rem;
  background: #2e8bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.load-more:hover {
  background: #1c6ed8;
}
</style>
