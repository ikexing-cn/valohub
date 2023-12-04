interface Multifactor {
  type: 'multifactor'
  multifactor: {
    email: string
    type: 'email'
    multiFactorCodeLength: number
  }
  country: string
}

export interface Response {
  type: 'response'
  response: {
    parameters: {
      uri: string
    }
  }
}

export type PutAuthRequestResponse = Multifactor | Response
