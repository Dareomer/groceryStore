import { describe, it, expect } from "vitest"
import { validRole } from "../src/utils/validation"

describe("Role validation", () => {

    it("accepts a valid role", () => {
        expect(validRole(1)).toBe(true)
    })

    it("rejects a role below the minimum", () => {
        expect(validRole(0)).toBe(false)
    })

    it("rejects a role above the maximum", () => {
        expect(validRole(3)).toBe(false)
    })

})