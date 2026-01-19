# Timer App

A simple, elegant countdown timer application built with vanilla JavaScript, HTML, and CSS.

## Features

- **Multiple Timers**: Run up to 3 independent countdown timers simultaneously
- **Flexible Time Input**: Set hours, minutes, and seconds (format: HH:MM:SS)
- **Visual Progress Ring**: Circular display with an animated ring that unwinds as time passes
- **Color Indicators**:
  - Cyan: Normal countdown
  - Orange: 25% or less time remaining
  - Red: 10% or less time remaining
- **Looping Alarm**: Pleasant 4-note chime that repeats every 2 seconds when a timer completes
- **Dismiss Button**: Pulsing green button appears when timer ends - click to stop the alarm
- **Timer Controls**: Start, Pause, Resume, Reset, and Remove for each timer

## How to Use

1. Open `index.html` in a web browser
2. Click one of the three "+" buttons to add a timer
3. Enter the desired countdown time using the hour, minute, and second input fields
4. Click **Start** to begin the countdown
5. Use **Pause** to temporarily stop the timer, then **Resume** to continue
6. When the timer completes, click **Dismiss** to stop the alarm sound
7. Click **Reset** to clear the timer and enter a new time
8. Click **Remove** to delete a timer and free up a slot

## File Structure

```
├── index.html    # Main HTML structure
├── styles.css    # Styling and animations
├── script.js     # Timer logic and functionality
├── project.md    # Project requirements
└── README.md     # This file
```

## Technical Details

### CSS
- Uses CSS custom properties (`--progress`) for dynamic progress ring animation
- Conic gradients with mask compositing create the ring effect
- Flexbox layout for responsive timer positioning

### JavaScript
- Web Audio API generates notification sounds programmatically
- Each timer is tracked as an object with its own interval
- Unique IDs (timestamps) prevent conflicts between timers

## Browser Compatibility

Works in all modern browsers that support:
- CSS `conic-gradient`
- CSS `mask-composite`
- Web Audio API

## License

Free to use and modify.
