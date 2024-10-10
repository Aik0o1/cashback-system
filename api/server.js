import "dotenv/config"
import app from "./src/app.js"

app.listen(5050, () => {
    console.log("Backend rodando na porta 5050....")
})