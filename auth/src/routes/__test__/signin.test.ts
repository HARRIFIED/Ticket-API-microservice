import request from 'supertest';
import {app} from '../../app'

it('fails when an email that does not exist is supplied', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(400)
})

it('response with a cookie header when login is sucessful', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(201)

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(200)
        
    expect(response.get('Set-Cookie')).toBeDefined()
})

it('fails when an incorrect password is used', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(201)

    await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: "passworD"
        })
        .expect(400)
})