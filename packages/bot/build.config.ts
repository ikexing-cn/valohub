import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'src/',
      builder: 'mkdist',
      format: 'cjs',
    },
  ],
})
