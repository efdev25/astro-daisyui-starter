<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte'

  type User = { id: number; name: string; email: string }

  let count = $state(0)
  let users = $state<User[]>([])
  let loading = $state(false)
  let error = $state('')
  let form = $state({ name: '', email: '' })
  let fieldErrors = $state<{ name?: string[]; email?: string[] }>({})

  let editingId = $state<number | null>(null)
  let editForm = $state({ name: '', email: '' })
  let editErrors = $state<{ name?: string[]; email?: string[] }>({})

  async function loadUsers() {
    loading = true
    error = ''
    try {
      const res = await fetch('/api/users')
      users = await res.json()
    } catch {
      error = 'Errore nel caricamento utenti'
    } finally {
      loading = false
    }
  }

  async function createUser() {
    fieldErrors = {}
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.status === 422) {
      const data = await res.json()
      fieldErrors = data.errors
      return
    }

    if (res.ok) {
      form = { name: '', email: '' }
      await loadUsers()
    }
  }

  function startEdit(user: User) {
    editingId = user.id
    editForm = { name: user.name, email: user.email }
    editErrors = {}
  }

  function cancelEdit() {
    editingId = null
    editErrors = {}
  }

  async function updateUser(id: number) {
    editErrors = {}
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })

    if (res.status === 422) {
      const data = await res.json()
      editErrors = data.errors
      return
    }

    if (res.ok) {
      const updated: User = await res.json()
      users = users.map(u => u.id === id ? updated : u)
      editingId = null
    }
  }

  async function deleteUser(id: number) {
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    users = users.filter(u => u.id !== id)
  }
</script>

<div class="flex flex-col gap-6 w-full max-w-lg">

  <div class="flex justify-end">
    <ThemeToggle />
  </div>

  <!-- Contatore -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body items-center text-center">
      <h2 class="card-title">Contatore</h2>
      <p class="text-4xl font-bold">{count}</p>
      <div class="card-actions">
        <button class="btn btn-primary" onclick={() => count++}>+</button>
        <button class="btn btn-ghost" onclick={() => count--}>-</button>
      </div>
    </div>
  </div>

  <!-- Form crea utente -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Crea utente</h2>
      <div class="form-control gap-2">
        <input
          class="input input-bordered"
          class:input-error={fieldErrors.name}
          placeholder="Nome"
          bind:value={form.name}
        />
        {#if fieldErrors.name}
          <span class="text-error text-sm">{fieldErrors.name[0]}</span>
        {/if}
        <input
          class="input input-bordered"
          class:input-error={fieldErrors.email}
          placeholder="Email"
          bind:value={form.email}
        />
        {#if fieldErrors.email}
          <span class="text-error text-sm">{fieldErrors.email[0]}</span>
        {/if}
        <button class="btn btn-primary" onclick={createUser}>Crea</button>
      </div>
    </div>
  </div>

  <!-- Lista utenti -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-center">
        <h2 class="card-title">Utenti</h2>
        <button class="btn btn-sm btn-outline" onclick={loadUsers}>
          {loading ? 'Caricamento...' : 'Carica'}
        </button>
      </div>

      {#if error}
        <div class="alert alert-error">{error}</div>
      {/if}

      {#if users.length === 0 && !loading}
        <p class="text-base-content/50 text-sm">Nessun utente. Clicca "Carica".</p>
      {/if}

      <ul class="flex flex-col gap-2">
        {#each users as user}
          <li class="flex flex-col gap-2 p-2 rounded bg-base-200">
            {#if editingId === user.id}
              <!-- Form modifica inline -->
              <div class="form-control gap-2">
                <input
                  class="input input-bordered input-sm"
                  class:input-error={editErrors.name}
                  bind:value={editForm.name}
                  placeholder="Nome"
                />
                {#if editErrors.name}
                  <span class="text-error text-xs">{editErrors.name[0]}</span>
                {/if}
                <input
                  class="input input-bordered input-sm"
                  class:input-error={editErrors.email}
                  bind:value={editForm.email}
                  placeholder="Email"
                />
                {#if editErrors.email}
                  <span class="text-error text-xs">{editErrors.email[0]}</span>
                {/if}
                <div class="flex gap-2">
                  <button class="btn btn-xs btn-primary flex-1" onclick={() => updateUser(user.id)}>
                    Salva
                  </button>
                  <button class="btn btn-xs btn-ghost" onclick={cancelEdit}>
                    Annulla
                  </button>
                </div>
              </div>
            {:else}
              <!-- Vista normale -->
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-medium">{user.name}</p>
                  <p class="text-sm text-base-content/60">{user.email}</p>
                </div>
                <div class="flex gap-1">
                  <button class="btn btn-xs btn-outline" onclick={() => startEdit(user)}>
                    Modifica
                  </button>
                  <button class="btn btn-xs btn-error btn-outline" onclick={() => deleteUser(user.id)}>
                    Elimina
                  </button>
                </div>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  </div>

</div>
