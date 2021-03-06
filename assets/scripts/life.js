const configurations = require('./preconfigurations.js')
let cells = []
let length = 64
let height = 64
// let backgroundColor
let tick = 80
let dense = false // onTrue: { length: 256, with 128 } or {both: 128} 
let mirror = false
let paused = true
let enlarged = false
let preset = 1
let generation = 0
const isFilled = (x, y) => cells[x] && cells[x][y]
const liveCount = cells => cells.flat().filter(cell => cell === true).length
const population = cells => liveCount(cells) > 10 ? '~' + +(Math.ceil(liveCount(cells) / 10.0) * 10) : liveCount(cells)
const deadOrAlive = (cell, count) => cell ? (count === 2 || count === 3) : count === 3
const countNeighbors = (x, y) => {
    let neighbors = []
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) {
                continue
            }
            neighbors.push(isFilled((x + i + length) % length, (y + j + height) % height))
        }
    }
    return liveCount(neighbors)
}

const preconfigure = setting => {
    let config
    switch (setting) {
        case 2: // glosper glider
            config = configurations.gosperGlider
            break
        case 3: // spiral flower
            config = configurations.spiralFlower
            break
        case 4: // spiral flower 2
            config = configurations.spiralFlower2
            break
        case 5: // spiral flower 3
            config = configurations.spiralFlower3
            break
        default:
    }

    config.forEach(coord => cells[coord[0]][coord[1]] = true)
}

const draw = () => {
    let HTML = ''
    cells.forEach((row, x) => {
        row.forEach((cell, y) => {
            cell ? HTML += `<div id="${x}-${y}" class="cell alive"></div>` : HTML += `<div id="${x}-${y}" class="cell"></div>`
        })
    })

    $('#frame').html(HTML) // display new gridstate
    setTimeout(() => {
        displayInfo()
        if (!paused) {
            update()
            generation++
        }
    }, tick)
}

const update = () => {
    cells = cells.map((row, x) => row.map((cell, y) => deadOrAlive(cell, countNeighbors(x, y))))
    draw()
}

const displayInfo = () => {
    $('#count').text(population(cells))
        $('#generation').text(generation)
}

const init = () => {
    for (let i = 0; i < height; i++) {
        cells[i] = []
        for (let j = 0; j < length; j++) {
            if (preset === 1) {
                cells[i][j] = Math.random() < .5
            } else {
                cells[i][j] = false
            }
        }
    }
    if (preset > 1) preconfigure(preset)
    update()
}

/**
 * EVENT LISTENERS
 */
// Pause and play game
$('#start').on('click', () => {
    if (paused) {
      paused = false
      $('#start').css({color: 'blue'})
      update()
    } else {
      paused = true
      $('#start').css({color: 'black'})
    }
})
// Rewind
$('#rewind').on('click', function () {
})
// Fast forward
$('#fastforward').on('click', () => {
    if (tick >= 80) {
        tick /= 3
        $(event.target).css({color: '#4AC948'})
    } else {
        tick *= 3
        $(event.target).css({color: 'black'})
    }
})
// Reset game
$('#reset').on('click', () => {
    generation = 0
    paused = true
    $('#start').css({color: 'black'})
    init()
})
// Landscape
$('#landscape').on('click', function () {
    if (enlarged) {
        $('#super').animate({width: '516px'}, 2000)
        $('#frame').animate({width: '514px'}, 1800)
        $('#interface').animate({left: 480, width: '35%'}, 2000)
        $(this).css({color: 'black'})
        length = 64
        tick /= (3/2)
        enlarged = false
    } else {
        $('#super').animate({width: '1028px'}, 2000)
        $('#frame').animate({width: '1026px'}, 2000)
        $('#interface').animate({left: 220, width: '71%'}, 2000)
        $(this).css({color: '#7e39b8'})
        length = 128
        tick *= (3/2)
        enlarged = true
    }
    init()
})
// Play god
let isDown = false
$(document).mousedown(() => isDown = true).mouseup(() => isDown = false)
$('#frame').on('mouseover', '.cell', function (e) {
    displayInfo()
    if (isDown) {
        const coords = $(this).attr('id').split('-')
        cells[+coords[0]][+coords[1]] = !cells[+coords[0]][+coords[1]]
        console.log(coords + ' = ' + cells[+coords[0]][+coords[1]])
        $(this).toggleClass('alive')
        // $('div.cell.alive').css('background', backgroundColor)
    }
}).on('click', '.cell', function (e) {
    displayInfo()
    const coords = $(this).attr('id').split('-')
    cells[+coords[0]][+coords[1]] = !cells[+coords[0]][+coords[1]]
    console.log(coords + ' = ' + cells[+coords[0]][+coords[1]])
    $(this).toggleClass('alive')
    // $('div.cell.alive').css('background', backgroundColor)
})
// Paint brush
$('#paintbrush').on('click', function () {
    if (mirror) {
        $(this).css({color: 'black'})
        mirror = false
    } else {
        $(this).css({color: '#b913aa'})
        mirror = true
    }
})
// Presets
$('select').on('change', function () {
    $('option:selected').each(function () {
        preset = parseInt($(this).attr('data-option'))
        $('#reset').trigger('click')
    })
})


module.exports = {init}

// Choose color - DEPRECATED; CAUSES MASSIVE LAG
// $('#color-picker').on('change', function () {
//     backgroundColor = $(this).val()
//     draw()
// })
// $('#frame').on('DOMNodeInserted', 'div.cell.alive', () => {
//     $('div.cell.alive').css('background', backgroundColor)
// })