import { corsEventHandler } from 'nitro-cors'

export default corsEventHandler(() => {}, {
  origin: '*',
  methods: '*',
})
