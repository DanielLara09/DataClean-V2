import bcrypt from 'bcrypt';

const password = 'Despacho2025*'; // 👉 CAMBIA ESTO

const saltRounds = 10;

bcrypt.hash(password, saltRounds).then(hash => {
  console.log('Hash generado para', password, ':');
  console.log(hash);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
