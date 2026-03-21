const packets = [

{
protocol:"HTTP",
destination:"192.168.1.15",
data:"GET /login password=123456"
},

{
protocol:"HTTPS",
destination:"army.mil",
data:"Encrypted Traffic"
},

{
protocol:"FTP",
destination:"unknown-ip",
data:"Large data transfer detected"
}

]

export default packets