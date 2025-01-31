import { insecureAuthToken } from '@anta-semenov/electric-sql/auth'
import { genUUID } from '@anta-semenov/electric-sql/util'

// This is just a demo. In a real app, the user ID would
// usually come from somewhere else :)
const dummyUserId = genUUID()

// Generate an insecure authentication JWT.
// See https://electric-sql.com/docs/usage/auth for more details.
export const authToken = () => {
  const claims = {'user_id': dummyUserId}

  return insecureAuthToken(claims)
}
