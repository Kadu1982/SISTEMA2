const bcrypt = require('bcryptjs');

const senha = 'Teste@123';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(senha, salt);

console.log('========================================');
console.log('Senha:', senha);
console.log('Hash:', hash);
console.log('========================================');
console.log('\nVerificação:', bcrypt.compareSync(senha, hash) ? '✅ OK' : '❌ FALHOU');
