import { describe, it, expect } from "vitest"
import bcrypt from "bcrypt"

describe("Password hashing", () => {

    it("accepts the correct password", async () => {
        const password = "ShopA001!"
        const hash = await bcrypt.hash(password, 10)

        expect(await bcrypt.compare(password, hash)).toBe(true)
    })

    it("rejects an incorrect password", async () => {
        const hash = await bcrypt.hash("ShopA001!", 10)

        expect(await bcrypt.compare("Wrong123!", hash)).toBe(false)
    })

})