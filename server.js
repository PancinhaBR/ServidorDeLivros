const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const cors = require("cors")

const app = express()
const PORT = 3000

// Habilita CORS para todas as origens e métodos
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}))

app.use(express.json())

const db = new sqlite3.Database("./database.db")

// Criar tabela livros
db.run(`CREATE TABLE IF NOT EXISTS livros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    ano_publicacao INTEGER NOT NULL,
    genero TEXT NOT NULL,
    idioma TEXT NOT NULL,
    preco REAL NOT NULL
)`)

app.get("/", (req, res) => {
    res.json({ "teste": "ok" })
})

// Cadastrar livro
app.post("/livros", (req, res) => {
    let { titulo, autor, ano_publicacao, genero, idioma, preco } = req.body
    db.run(
        `INSERT INTO livros (titulo, autor, ano_publicacao, genero, idioma, preco) VALUES (?, ?, ?, ?, ?, ?)`,
        [titulo, autor, ano_publicacao, genero, idioma, preco],
        function(err){
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Erro ao cadastrar livro" });
            } else {
                res.json({
                    id: this.lastID,
                    titulo,
                    autor,
                    ano_publicacao,
                    genero,
                    idioma,
                    preco
                });
            }
        }
    );
})

// Listar todos os livros
app.get("/livros", (req, res) => {
    db.all(`SELECT * FROM livros`, [], (err, rows) =>{
        if (err) {
            res.status(500).json({ error: "Erro ao buscar livros" });
        } else {
            res.json(rows)
        }
    })
})

// Selecionar um livro
app.get("/livros/:id", (req, res) => {
    let idLivro = req.params.id;
    db.get(`SELECT * FROM livros WHERE id = ?`, [idLivro], (err, result) => {
        if(result){
            res.json(result)
        } else {
            res.status(404).json({ "message" : "Livro não encontrado." })
        }
    })
})

// Deletar livro
app.delete("/livros/:id", (req, res) => {
    let idLivro = req.params.id
    db.run(`DELETE FROM livros WHERE id = ?`, [idLivro], function(){
        if(this.changes === 0){
            res.status(404).json({ "message" : "Livro não encontrado" })
        } else {
            res.json({ "message" : "Livro deletado" })
        }
    })    
})

// Editar livro
app.put("/livros/:id", (req, res) => {
    let idLivro = req.params.id
    let { titulo, autor, ano_publicacao, genero, idioma, preco } = req.body
    db.run(`UPDATE livros SET titulo = ?, autor = ?, ano_publicacao = ?, genero = ?, idioma = ?, preco = ? WHERE id = ?`,
        [titulo, autor, ano_publicacao, genero, idioma, preco, idLivro],
        function(){
            res.json({ "message" : "Livro atualizado com sucesso" })
        })
})

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
