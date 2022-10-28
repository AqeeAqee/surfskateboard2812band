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
    range = strip.range(0, LedsCount)
    range.setBrightness(Math.map(LedsCount, 0, strip.length(), bgBrightness, maxBrightness))
    range.showRainbow(Hue, Hue)
    range = strip.range(LedsCount + 1, strip.length() - LedsCount)
    range.setBrightness(bgBrightness)
    range.showColor(baseColor)
    strip.show()
}
radio.onReceivedValue(function (name, value) {
    serial.writeValue(name, value)
    if (name == "mode") {
        if (value == 0) {
            mode = value
        } else if (value == 1) {
            mode = value
        } else {
            mode = 1
        }
    } else {
        mode = 0
        if (false) {
        	
        } else if (name == "HUE") {
            Hue = value
            LedsCount = 55
            baseColor = neopixel.hsl(Hue, 99, 50)
        } else if (name == "Max Brightness") {
            maxBrightness = value
            LedsCount = 55
        } else if (name == "Min Brightness") {
            bgBrightness = value
            LedsCount = 0
        } else if (name == "Acc Threshold %") {
            accThreshold = value * 10.24
        } else if (name == "Acc X Threshold %") {
            accXThreshold = value * 10.24
        } else if (name == "Acc Y Threshold %") {
            accYThresshold = value * 10.24
        } else {
        	
        }
    }
})
function initSmoothPool (list: number[]) {
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
let mode = 0
let baseColor = 0
let Hue = 0
let bgBrightness = 0
let maxBrightness = 0
let asValues: number[] = []
let ayValues: number[] = []
let axValues: number[] = []
let accYThresshold = 0
let accXThreshold = 0
let accThreshold = 0
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
accThreshold = 1111
accXThreshold = 222
accYThresshold = 888
initSmoothPool(axValues)
initSmoothPool(ayValues)
initSmoothPool(asValues)
maxBrightness = 33
for (let iBright = 0; iBright <= maxBrightness; iBright++) {
    setNeopixelRainbow(iBright)
    basic.pause(8)
}
for (let iBright = 0; iBright <= maxBrightness; iBright++) {
    setNeopixelRainbow(maxBrightness - iBright)
    basic.pause(8)
}
maxBrightness = 50
bgBrightness = 4
// pink=330
// blue=210
// orange=10
// 
Hue = 10
baseColor = neopixel.hsl(Hue, 99, 50)
for (let iBright = 0; iBright <= maxBrightness; iBright++) {
    strip1.setBrightness(iBright)
    strip2.setBrightness(iBright)
    strip1.showColor(baseColor)
    strip2.showColor(baseColor)
    basic.pause(4)
}
for (let iBright = 0; iBright <= maxBrightness; iBright++) {
    strip1.setBrightness(maxBrightness - iBright)
    strip2.setBrightness(maxBrightness - iBright)
    strip1.showColor(baseColor)
    strip2.showColor(baseColor)
    basic.pause(8)
    if (maxBrightness - iBright <= bgBrightness) {
        break;
    }
}
// 0=setting
// 1=normal
mode = 1
loops.everyInterval(50, function () {
    if (input.buttonIsPressed(Button.A)) {
        Hue += -2
        if (Hue < 0) {
            Hue = 360
        }
        LedsCount = strip.length()
        baseColor = neopixel.hsl(Hue, 99, maxBrightness)
    } else if (input.buttonIsPressed(Button.B)) {
        Hue += 2
        if (Hue >= 360) {
            Hue = 0
        }
        LedsCount = strip.length()
        baseColor = neopixel.hsl(Hue, 99, maxBrightness)
    }
})
loops.everyInterval(50, function () {
    // 0=setting
    // 1=normal
    if (mode == 1) {
        ax = smooth(input.acceleration(Dimension.X), axValues)
        ay = smooth(input.acceleration(Dimension.Y), ayValues)
        _as = smooth(input.acceleration(Dimension.Strength), asValues)
        strLog = "" + _as + "," + ax + "," + ay
        radio.sendString(strLog)
    }
})
basic.forever(function () {
    deltaAY = ayValues[0] - ayValues[ayValues.length - 1]
    if (_as >= accThreshold && Math.abs(ax) > accXThreshold && deltaAY >= accYThresshold) {
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
        LedsCount += -2
    }
    strip = strip1
    setStripe()
    strip = strip2
    setStripe()
    basic.pause(5)
})
