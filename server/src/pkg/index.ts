export const pkgName = 'drew'

export const database = (name: string, password: string) => {
  console.log("making the database")
  return 'jdbc:mysql://localhost:3306/' + name + '?user=' + name + '&password=' + password;
}
