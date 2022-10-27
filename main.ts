function setNeopixelRainbow (Brightness: number) {
    for (let iLed = 0; iLed <= strip1.length(); iLed++) {
        strip1.setPixelColor(iLed, neopixel.hsl(iLed * 360 / strip1.length(), 99, Brightness))
        strip2.setPixelColor(iLed, neopixel.hsl(iLed * 360 / strip1.length(), 99, Brightness))
    }
    strip1.show()
    strip2.show()
}
function setStripe () {
    // NeoLight bug when count lenght =1, show 1 green/yellow led.
    if (LedsCount < 0 || Math.floor(LedsCount) == 1) {
        LedsCount = 0
    }
    strip.clear()
    strip.setBrightness(maxBrightness)
    range = strip.range(0, LedsCount)
    range.showRainbow(Hue, Hue)
    strip.setBrightness(bgBrightness)
    range = strip.range(LedsCount + 1, strip.length() - LedsCount)
    range.showColor(baseColor)
    strip.show()
}
function initValues (list: number[]) {
    for (let index = 0; index <= 4; index++) {
        list.push(0)
    }
}
function smooth (newValue: number, values: number[]) {
    values.unshift(newValue)
    values.pop()
    sum = 0
    for (let value of values) {
        sum += value
    }
    return sum / values.length
}
let newLedsCount = 0
let deltaAY = 0
let strLog = ""
let _as = 0
let ay = 0
let ax = 0
let sum = 0
let range: neopixel.Strip = null
let strip: neopixel.Strip = null
let LedsCount = 0
let asValues: number[] = []
let ayValues: number[] = []
let axValues: number[] = []
let baseColor = 0
let Hue = 0
let bgBrightness = 0
let maxBrightness = 0
let strip2: neopixel.Strip = null
let strip1: neopixel.Strip = null
strip1 = neopixel.create(DigitalPin.P15, 40, NeoPixelMode.RGB)
strip2 = neopixel.create(DigitalPin.P16, 40, NeoPixelMode.RGB)
radio.setGroup(1)
basic.showLeds(`
    . . . . .
    . . . . .
    # # # # #
    . # . # .
    . . . . .
    `)
maxBrightness = 33
maxBrightness = 88
bgBrightness = 4
// pink=330
// blue=210
// orange=10
// 
Hue = 10
baseColor = neopixel.hsl(Hue, 99, 55)
initValues(axValues)
initValues(ayValues)
initValues(asValues)
loops.everyInterval(50, function () {
    if (input.buttonIsPressed(Button.A)) {
        Hue += -2
        if (Hue < 0) {
            Hue = 355
        }
        LedsCount = 40
        baseColor = neopixel.hsl(Hue, 99, 55)
    } else if (input.buttonIsPressed(Button.B)) {
        Hue += 2
        if (Hue >= 360) {
            Hue = 0
        }
        LedsCount = 40
        baseColor = neopixel.hsl(Hue, 99, 55)
    }
})
loops.everyInterval(50, function () {
    ax = smooth(input.acceleration(Dimension.X), axValues)
    ay = smooth(input.acceleration(Dimension.Y), ayValues)
    _as = smooth(input.acceleration(Dimension.Strength), asValues)
    strLog = "" + _as + "," + ax + "," + ay
    radio.sendString(strLog)
    serial.writeLine(strLog)
})
basic.forever(function () {
    deltaAY = ayValues[0] - ayValues[ayValues.length - 1]
    if (_as >= 1111 && Math.abs(ax) > 222 && deltaAY >= 888) {
        newLedsCount = ay * strip1.length() / 1024 - 0
        if (newLedsCount > 40) {
            newLedsCount = 40
        }
    } else {
        newLedsCount = 0
    }
    if (newLedsCount >= LedsCount) {
        LedsCount = newLedsCount
    } else {
        LedsCount += -1.5
    }
    strip = strip1
    setStripe()
    strip = strip2
    setStripe()
    basic.pause(5)
})
