import { isValidEmail } from "../src/userService";

describe('test isValidEmail', ()=>{

    // Test 1. Deberia retornar true para un correo valido
    it('it should return true for valid email',()=>{
        const email="example@domain.com";
        expect(isValidEmail(email)).toBe(true);
    });

    // Test 2. Deberia retornar false para un correo falso
    it("it should return false for invalid email", ()=>{
        const email="example@domain";
        expect(isValidEmail(email)).toBe(false);
    });

    // Test 3. Deberia aceptar espacios en blanco
    it("it should return true and remove whitespaces",()=>{
        const email=" example@domain.com ";
        expect(isValidEmail(email)).toBe(true);
    });
});