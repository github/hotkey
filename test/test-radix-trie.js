import {describe, it, expect} from 'vitest'
import {RadixTrie, Leaf} from '../src/index.ts'

describe('RadixTrie', () => {
  describe('insert', () => {
    it('adds hotkey to trie in a searchable manner', () => {
      const trie = new RadixTrie()
      const leaf = trie.insert(['ctrl+p', 'a', 'b'])

      expect(trie.get('ctrl+p')).toBeTruthy()
      expect(trie.get('ctrl+p').get('a')).toBeTruthy()
      expect(trie.get('ctrl+p').get('a').get('b')).toBeTruthy()
      expect(trie.get('ctrl+p').get('a').get('b')).toBe(leaf)
      expect(leaf).toBeInstanceOf(Leaf)
    })

    it('adds new hotkey to trie using existing maps', () => {
      const trie = new RadixTrie()
      const leaf = trie.insert(['ctrl+p', 'a', 'b'])
      const otherLeaf = trie.insert(['ctrl+p', 'a', 'c'])

      expect(trie.get('ctrl+p').get('a').get('b')).toBe(leaf)
      expect(trie.get('ctrl+p').get('a').get('c')).toBe(otherLeaf)
      expect(leaf).not.toBe(otherLeaf)
      expect(leaf).toBeInstanceOf(Leaf)
      expect(otherLeaf).toBeInstanceOf(Leaf)
    })

    it('overrides leaves with new deeper insertions', () => {
      const trie = new RadixTrie()
      const otherLeaf = trie.insert(['g', 'c', 'e'])

      expect(trie.get('g').get('c')).toBeInstanceOf(RadixTrie)
      expect(trie.get('g').get('c').get('e')).toBe(otherLeaf)
    })
  })

  describe('delete', () => {
    it('removes self from parents, if empty', () => {
      const trie = new RadixTrie()
      const leaf = trie.insert(['ctrl+p', 'a', 'b'])
      const keyATrie = trie.get('ctrl+p').get('a')
      const success = leaf.parent.delete(leaf)

      expect(success).toBe(true)
      expect(trie.get('ctrl+p')).toBeUndefined()
      expect(keyATrie.get('b')).toBeUndefined()
    })

    it('preserves parents with other tries', () => {
      const trie = new RadixTrie()
      trie.insert(['ctrl+p', 'a', 'b'])
      const otherLeaf = trie.insert(['ctrl+p', 'a', 'c'])
      const keyATrie = trie.get('ctrl+p').get('a')
      const keyCTrie = keyATrie.get('c')
      const success = otherLeaf.parent.delete(otherLeaf)

      expect(success).toBe(true)
      expect(keyCTrie.children.length).toBe(0)
    })
  })
})
