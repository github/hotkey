import {Leaf, RadixTrie} from './radix-trie'
import {fireDeterminedAction, expandHotkeyToEdges, isFormField} from './utils'
import {SequenceTracker} from './sequence'
import {eventToHotkeyString} from './hotkey'

export {eventToHotkeyString, normalizeHotkey, NormalizedHotkeyString} from './hotkey'
export {SequenceTracker, normalizeSequence, NormalizedSequenceString} from './sequence'
export {RadixTrie, Leaf} from './radix-trie'

const hotkeyRadixTrie = new RadixTrie<HTMLElement>()
const elementsLeaves = new WeakMap<HTMLElement, Array<Leaf<HTMLElement>>>()
let currentTriePosition: RadixTrie<HTMLElement> | Leaf<HTMLElement> = hotkeyRadixTrie

const sequenceTracker = new SequenceTracker({
  onReset() {
    currentTriePosition = hotkeyRadixTrie
  }
})

function keyDownHandler(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (!(event.target instanceof Node)) return
  if (isFormField(event.target)) {
    const target = event.target as HTMLElement
    if (!target.id) return
    if (!target.ownerDocument.querySelector(`[data-hotkey-scope="${target.id}"]`)) return
  }

  // If the user presses a hotkey that doesn't exist in the Trie,
  // they've pressed a wrong key-combo and we should reset the flow
  const newTriePosition = (currentTriePosition as RadixTrie<HTMLElement>).get(eventToHotkeyString(event))
  if (!newTriePosition) {
    sequenceTracker.reset()
    return
  }
  sequenceTracker.registerKeypress(event)

  currentTriePosition = newTriePosition
  if (newTriePosition instanceof Leaf) {
    const target = event.target as HTMLElement
    let shouldFire = false
    let elementToFire
    const formField = isFormField(target)

    for (let i = newTriePosition.children.length - 1; i >= 0; i -= 1) {
      elementToFire = newTriePosition.children[i]
      const scope = elementToFire.getAttribute('data-hotkey-scope')
      if ((!formField && !scope) || (formField && target.id === scope)) {
        shouldFire = true
        break
      }
    }

    if (elementToFire && shouldFire) {
      fireDeterminedAction(elementToFire, sequenceTracker.path)
      event.preventDefault()
    }

    sequenceTracker.reset()
  }
}

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
