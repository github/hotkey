import {Leaf, RadixTrie} from './radix-trie'
import {fireDeterminedAction, expandHotkeyToEdges, isFormField} from './utils'
import eventToHotkeyString from './hotkey'

const hotkeyRadixTrie = new RadixTrie()
const elementsLeaves = new WeakMap<HTMLElement, Array<Leaf<HTMLElement>>>()
let currentTriePosition: RadixTrie | Leaf<unknown> = hotkeyRadixTrie
let resetTriePositionTimer: number | null = null

function resetTriePosition() {
  resetTriePositionTimer = null
  currentTriePosition = hotkeyRadixTrie
}

function keyDownHandler(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (event.target instanceof Node && isFormField(event.target)) return

  if (resetTriePositionTimer != null) {
    window.clearTimeout(resetTriePositionTimer)
  }
  resetTriePositionTimer = window.setTimeout(resetTriePosition, 1500)

  // If the user presses a hotkey that doesn't exist in the Trie,
  // they've pressed a wrong key-combo and we should reset the flow
  const newTriePosition = (currentTriePosition as RadixTrie).get(eventToHotkeyString(event))
  if (!newTriePosition) {
    resetTriePosition()
    return
  }

  currentTriePosition = newTriePosition
  if (newTriePosition instanceof Leaf) {
    fireDeterminedAction(newTriePosition.children[newTriePosition.children.length - 1] as HTMLElement)
    event.preventDefault()
    resetTriePosition()
    return
  }
}

export {RadixTrie, Leaf, eventToHotkeyString}

export function install(element: HTMLElement, hotkey?: string): void {
  // Install the keydown handler if this is the first install
  if (Object.keys(hotkeyRadixTrie.children).length === 0) {
    document.addEventListener('keydown', keyDownHandler)
  }

  const hotkeys = expandHotkeyToEdges(hotkey || element.getAttribute('data-hotkey') || '')
  const leaves = hotkeys.map(h => (hotkeyRadixTrie.insert(h) as Leaf<HTMLElement>).add(element))
  elementsLeaves.set(element, leaves)
}

export function uninstall(element: HTMLElement): void {
  const leaves = elementsLeaves.get(element)
  if (leaves && leaves.length) {
    for (const leaf of leaves) {
      leaf && leaf.delete(element)
    }
  }

  if (Object.keys(hotkeyRadixTrie.children).length === 0) {
    document.removeEventListener('keydown', keyDownHandler)
  }
}
