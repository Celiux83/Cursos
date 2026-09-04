import { User } from "../src";
import { canCheckout, isPremium, isValidEmail, normalizeEmail } from "../src/userService";

describe('test isValidEmail', ()=>{

    // Test 1 - Deberia retornar true para un correo valido
    it('it should return true for valid email',()=>{
        const email='example@domain.com';
        expect(isValidEmail(email)).toBe(true);
    });

    // Test 2 - Deberia retornar false para un correo falso
    it('it should return false for invalid email', ()=>{
        const email='example@domain';
        expect(isValidEmail(email)).toBe(false);
    });

    // Test 3 - Deberia aceptar espacios en blanco
    it('it should return true and remove whitespaces',()=>{
        const email=' example@domain.com ';
        expect(isValidEmail(email)).toBe(true);
    });
});

describe('test normilizeEmail',()=>{

    //Test 4 - Deberia cambiar el correo a minusculas
    it('it should change email to lowercase', ()=>{
        const email='EXAMPLE@DOMAIN.COM';
        expect(normalizeEmail(email)).toEqual("example@domain.com")
    });

    // Test 5 - Deberia normalizar el email y quitar espacios
        it('it should normalize email and remove whitespaces', ()=>{
        const email=' Example@Domain.Com ';
        expect(normalizeEmail(email)).toEqual("example@domain.com")
    });
});

describe ('test isPremium',()=>{
let User:User;

    beforeEach(()=>{
        User = {
             id: 'u-5',
             email: 'user@test.com',
             name: 'Dino',
             role: 'premium',
             active: true,
             createdAt: '2025-09-04T00:00:00.000Z',
        };
    });
   
    // Test 6 - Deberia retornar true si el role del usuario es Premium
    it('it should return true for premium role', ()=>{
        expect(isPremium(User)).toBe(true)
    });
    
    // Test 7 - Deberia retornar false si el role del usuario es guest
    it('it should return false for guest role', ()=>{
        User.role = 'guest';
        expect(isPremium(User)).toBe(false)
    });

    // Test 8 - Deberia retornar false si el role del usuario es member
        it('it should return false for guest role', ()=>{
        User.role = 'member';
        expect(isPremium(User)).toBe(false)
    });
});

describe('test canCheckout',()=>{
let user: User;

    beforeEach(() => {
        user = {
            id: 'u-5',
            email: 'user@test.com',
            name: 'Dino',
            role: 'premium',
            active: true,
            createdAt: '2025-09-04T00:00:00.000Z',
        };
    });

    //Test 9. es true si el usuario es activo y diferente de guest
    it('it should return false for an active con rol de member',()=>{
        expect(canCheckout(user)).toBe(true)
    });

    //Test 10. Es false si el usario es activo y es guest
    it('it should return false for an active con rol de member',()=>{
        user.role= 'guest';
        expect(canCheckout(user)).toBe(false)
    });

});