// ==========================================
// 1. VARIABLES AND STATE
// ==========================================
// This array will hold the random numbers we generate
let array = []; 

// How fast the animation runs (in milliseconds)
let delay = 50; 

// Flags to control if sorting is running or if it should stop
let stopSorting = false;
let isSorting = false;

// ==========================================
// 2. GETTING HTML ELEMENTS
// ==========================================
// We grab all the buttons, sliders, and the container from our HTML file
const barsContainer = document.getElementById('bars-container');

const sizeSlider = document.getElementById('size');
const sizeLabel = document.getElementById('size-label');

const speedSlider = document.getElementById('speed');
const speedLabel = document.getElementById('speed-label');

const generateBtn = document.getElementById('generate-btn');
const sortBtn = document.getElementById('sort-btn');
const algorithmSelect = document.getElementById('algorithm');

// ==========================================
// 3. COLOR SETTINGS
// ==========================================
// Standard color for untouched bars
const DEFAULT_COLOR = '#e0e0e0'; 
// Color when two bars are being compared
const COMPARE_COLOR = 'yellow'; 
// Color when two bars are swapping or moving
const SWAP_COLOR = 'red'; 
// Color when a bar is in its final sorted position
const SORTED_COLOR = '#4caf50'; // Green

// ==========================================
// 4. INITIALIZATION AND EVENTS
// ==========================================
// When the page first loads, generate a random array
window.onload = () => {
    generateArray();
};

// When the user moves the Array Size slider:
sizeSlider.addEventListener('input', () => {
    // Update the text label to show the new size
    sizeLabel.textContent = sizeSlider.value;
    
    // If not currently sorting, generate a new array right away
    if (!isSorting) {
        generateArray();
    } else {
        // If sorting is running, tell it to stop, it will generate a new one soon
        stopSorting = true;
    }
});

// When the user moves the Speed slider:
speedSlider.addEventListener('input', () => {
    // Update our delay variable and text label
    delay = parseInt(speedSlider.value);
    speedLabel.textContent = delay;
});

// When the "Generate New Array" button is clicked:
generateBtn.addEventListener('click', () => {
    if (isSorting) {
        // Stop the current sorting process
        stopSorting = true;
    } else {
        // Create a new array directly
        generateArray();
    }
});

// When the "Start Sorting" button is clicked:
sortBtn.addEventListener('click', async () => {
    // If already sorting, do nothing to avoid breaking things
    if (isSorting) return;
    
    isSorting = true;
    stopSorting = false;
    
    // Disable controls so the user doesn't mess up the animation
    sizeSlider.disabled = true;
    algorithmSelect.disabled = true;
    sortBtn.disabled = true;
    
    // Find out which algorithm the user picked
    const algo = algorithmSelect.value;

    // Run the matching sorting function
    switch (algo) {
        case 'bubble':
            await bubbleSort();
            break;
        case 'selection':
            await selectionSort();
            break;
        case 'insertion':
            await insertionSort();
            break;
        case 'merge':
            await mergeSortWrap();
            break;
    }

    // Check if the sorting finished fully or if it was interrupted
    if (!stopSorting) {
        // If it finished normally, color all bars green!
        const bars = document.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.style.backgroundColor = SORTED_COLOR;
        });
    } else {
        // If it was stopped/canceled, generate a fresh new array instantly
        generateArray();
    }
    
    // Re-enable the controls now that sorting is done or canceled
    sizeSlider.disabled = false;
    algorithmSelect.disabled = false;
    sortBtn.disabled = false;
    
    // Reset our status tracking flags
    isSorting = false;
    stopSorting = false;
});

// ==========================================
// 5. HELPER FUNCTIONS
// ==========================================

// This function acts like a "pause button" to create the step-by-step animation
async function sleepHelper() {
    return new Promise(resolve => setTimeout(resolve, delay));
}

// Empties the container and creates a brand new random array of bars
function generateArray() {
    array = [];
    const size = parseInt(sizeSlider.value);
    barsContainer.innerHTML = ''; // Clear existing visual bars
    
    for (let i = 0; i < size; i++) {
        // Create a random number between 5 and 300
        const randomValue = Math.floor(Math.random() * 296) + 5; 
        array.push(randomValue);
        
        // Create an HTML <div> for this bar
        const bar = document.createElement('div');
        bar.classList.add('bar');
        
        // Calculate the height percentage relative to our max size (300)
        bar.style.height = `${(randomValue / 300) * 100}%`;
        bar.style.backgroundColor = DEFAULT_COLOR;
        
        // Add the new bar to the container on the screen
        barsContainer.appendChild(bar);
    }
}

// Changes the visual height of a specific bar on the screen
function updateBarHeight(index, numericValue) {
    const bars = document.querySelectorAll('.bar');
    if (bars[index]) {
        bars[index].style.height = `${(numericValue / 300) * 100}%`;
    }
}

// Changes the color of a specific bar on the screen
function setBarColor(index, colorString) {
    const bars = document.querySelectorAll('.bar');
    if (bars[index]) {
        bars[index].style.backgroundColor = colorString;
    }
}

// Swaps two elements in our array AND on the screen
async function swap(index1, index2) {
    // 1. Swap the internal array values
    let temp = array[index1];
    array[index1] = array[index2];
    array[index2] = temp;
    
    // 2. Update the visual heights of the bars
    updateBarHeight(index1, array[index1]);
    updateBarHeight(index2, array[index2]);
}

// ==========================================
// 6. SORTING ALGORITHMS
// ==========================================

async function bubbleSort() {
    const n = array.length;
    // Loop through the entire array
    for (let i = 0; i < n; i++) {
        // Each time we loop, the largest remaining element bubbles up to the end
        for (let j = 0; j < n - i - 1; j++) {
            // Check if user pressed "Generate New Array" to cancel the sort
            if (stopSorting) return;

            // Highlight the two bars being compared in yellow
            setBarColor(j, COMPARE_COLOR);
            setBarColor(j + 1, COMPARE_COLOR);
            await sleepHelper(); // Pause to let user see

            // If left bar is bigger than right bar, swap them!
            if (array[j] > array[j + 1]) {
                // Highlight red before swapping
                setBarColor(j, SWAP_COLOR);
                setBarColor(j + 1, SWAP_COLOR);
                await sleepHelper(); 
                
                // Perform the actual swap
                await swap(j, j + 1); 
            }

            // Revert colors back to normal before moving to next pair
            setBarColor(j, DEFAULT_COLOR);
            setBarColor(j + 1, DEFAULT_COLOR);
        }
        if (stopSorting) return;
        
        // The last element in this run is now fully sorted, mark it green
        setBarColor(n - i - 1, SORTED_COLOR);
    }
}

async function selectionSort() {
    const n = array.length;
    for (let i = 0; i < n; i++) {
        // Assume the current position 'i' holds the smallest value
        let minIdx = i;
        setBarColor(minIdx, SWAP_COLOR); 
        
        // Look through the rest of the array to find something even smaller
        for (let j = i + 1; j < n; j++) {
            if (stopSorting) return;

            setBarColor(j, COMPARE_COLOR);
            await sleepHelper(); // Pause to show comparison

            // Did we find a smaller element?
            if (array[j] < array[minIdx]) {
                // Remove color from the old minimum
                setBarColor(minIdx, DEFAULT_COLOR);
                // Update minimum index to our new find
                minIdx = j;
                // Highlight the new minimum
                setBarColor(minIdx, SWAP_COLOR);
            } else {
                // Keep looking, reset comparison color
                setBarColor(j, DEFAULT_COLOR);
            }
        }

        if (stopSorting) return;

        // If we found a new minimum, swap it with the starting position
        if (minIdx !== i) {
            setBarColor(i, COMPARE_COLOR);
            await sleepHelper();
            await swap(i, minIdx);
        }
        
        // Reset colors
        setBarColor(minIdx, DEFAULT_COLOR);
        // Position 'i' is now sorted, mark it green
        setBarColor(i, SORTED_COLOR);
    }
}

async function insertionSort() {
    const n = array.length;
    // The very first element is technically "sorted" by itself
    setBarColor(0, SORTED_COLOR);
    
    // Pick the next un-sorted element
    for (let i = 1; i < n; i++) {
        let currentNumber = array[i];
        let j = i - 1;
        
        // Highlight the current number we want to place
        setBarColor(i, SWAP_COLOR);
        await sleepHelper();
        
        // Keep shifting elements to the right until we find the correct spot for currentNumber
        while (j >= 0 && array[j] > currentNumber) {
            if (stopSorting) return;
            
            // Highlight the number we are about to shift over
            setBarColor(j, COMPARE_COLOR);
            await sleepHelper();
            
            // Shift the bigger element to the right
            array[j + 1] = array[j];
            updateBarHeight(j + 1, array[j + 1]); // Visual update
            
            setBarColor(j, SORTED_COLOR);
            setBarColor(j + 1, SORTED_COLOR);
            
            j--; // Move one step to the left
            
            if (j >= 0) {
                // Preview the next shift (if any)
                setBarColor(j + 1, SWAP_COLOR);
            }
        }
        if (stopSorting) return;
        
        // Place our currentNumber into its correct sorted spot!
        array[j + 1] = currentNumber;
        updateBarHeight(j + 1, currentNumber);
        
        setBarColor(j + 1, SORTED_COLOR);
        setBarColor(i, SORTED_COLOR);
        
        // Refresh the whole sorted section to be green
        for (let k = 0; k <= i; k++) {
            setBarColor(k, SORTED_COLOR);
        }
    }
}

// Wrapper function to start Merge Sort cleanly
async function mergeSortWrap() {
    await mergeSort(0, array.length - 1);
}

// Recursive function to split the array into halves until single elements remain
async function mergeSort(leftIndex, rightIndex) {
    if (leftIndex >= rightIndex || stopSorting) {
        return; // Already sorted if 1 element or less
    }
    
    // Find the middle point
    const middleIndex = leftIndex + Math.floor((rightIndex - leftIndex) / 2);
    
    // Sort the left half recursively
    await mergeSort(leftIndex, middleIndex);
    if (stopSorting) return;
    
    // Sort the right half recursively
    await mergeSort(middleIndex + 1, rightIndex);
    if (stopSorting) return;
    
    // Merge the two sorted halves together
    await merge(leftIndex, middleIndex, rightIndex);
}

// Merges two sorted sub-sections back into the main array
async function merge(leftIndex, middleIndex, rightIndex) {
    // Calculate sizes of the two sub-arrays
    const leftSize = middleIndex - leftIndex + 1;
    const rightSize = rightIndex - middleIndex;

    // Create temporary arrays
    let leftArray = new Array(leftSize);
    let rightArray = new Array(rightSize);

    // Copy data into temp arrays
    for (let i = 0; i < leftSize; i++) {
        leftArray[i] = array[leftIndex + i];
        setBarColor(leftIndex + i, COMPARE_COLOR); // Highlight the chunk
    }
    for (let j = 0; j < rightSize; j++) {
        rightArray[j] = array[middleIndex + 1 + j];
        setBarColor(middleIndex + 1 + j, COMPARE_COLOR); // Highlight the chunk
    }
    
    // Pause to show the two chunks we are preparing to merge
    await sleepHelper();

    // Loop variables: i for leftArray, j for rightArray, k for main array
    let i = 0;
    let j = 0;
    let k = leftIndex;

    // Start pointing to items in left and right arrays, picking the smallest one each time
    while (i < leftSize && j < rightSize) {
        if (stopSorting) return;

        if (leftArray[i] <= rightArray[j]) {
            // Left item is smaller or equal, put it in the main array
            array[k] = leftArray[i];
            i++;
        } else {
            // Right item is smaller, put it in the main array
            array[k] = rightArray[j];
            j++;
        }
        
        setBarColor(k, SWAP_COLOR); // Highlight inserting action
        updateBarHeight(k, array[k]); // Update visual size
        await sleepHelper();
        setBarColor(k, DEFAULT_COLOR); // Remove highlight
        
        k++; // Move main array pointer forward
    }

    // If there's any remaining items in the left array, dump them in
    while (i < leftSize) {
        if (stopSorting) return;
        array[k] = leftArray[i];
        
        setBarColor(k, SWAP_COLOR);
        updateBarHeight(k, array[k]);
        await sleepHelper();
        setBarColor(k, DEFAULT_COLOR);
        
        i++;
        k++;
    }

    // If there's any remaining items in the right array, dump them in
    while (j < rightSize) {
        if (stopSorting) return;
        array[k] = rightArray[j];
        
        setBarColor(k, SWAP_COLOR);
        updateBarHeight(k, array[k]);
        await sleepHelper();
        setBarColor(k, DEFAULT_COLOR);
        
        j++;
        k++;
    }
}
