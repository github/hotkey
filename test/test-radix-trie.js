/* global hotkey */

const {RadixTrie, Leaf} = hotkey

describe('RadixTrie', () => {
  describe('insert', () => {
    it('adds hotkey to trie in a searchable manner', () => {
      const trie = new RadixTrie()
      const leaf = trie.insert(['ctrl+p', 'a', 'b'])

      assert(trie.get('ctrl+p'), 'missing `ctrl+p` in trie')
      assert(trie.get('ctrl+p').get('a'), 'missing `ctrl+p a` in trie')
      assert(trie.get('ctrl+p').get('a').get('b'), 'missing `ctrl+p a b` in trie')
      assert.equal(trie.get('ctrl+p').get('a').get('b'), leaf, 'didnt return leaf correctly')
      assert.instanceOf(leaf, Leaf, 'leaf isnt a Leaf instance')
    })

    it('adds new hotkey to trie using existing maps', () => {
      const trie = new RadixTrie()
      const leaf = trie.insert(['ctrl+p', 'a', 'b'])
      const otherLeaf = trie.insert(['ctrl+p', 'a', 'c'])

      assert.equal(trie.get('ctrl+p').get('a').get('b'), leaf, 'didnt return `ctrl+p a b` end leaf correctly')
      assert.equal(trie.get('ctrl+p').get('a').get('c'), otherLeaf, 'didnt return `ctrl+p a c` end leaf correctly')
      assert.notEqual(leaf, otherLeaf, 'leaves are same reference but shouldnt be')
      assert.instanceOf(leaf, Leaf, 'leaf isnt a Leaf instance')
      assert.instanceOf(otherLeaf, Leaf, 'otherLeaf isnt a Leaf instance')
    })

    it('overrides leaves with new deeper insertions', () => {
      const trie = new RadixTrie()
      const otherLeaf = trie.insert(['g', 'c', 'e'])

      assert.instanceOf(trie.get('g').get('c'), RadixTrie, 'didnt override `g c` leaf as trie')
      assert.equal(trie.get('g').get('c').get('e'), otherLeaf, 'didnt add `g c e` leaf to trie')
    })
  })

  describe('delete', () => {
    it('removes self from parents, if empty', () => {
      const trie = new RadixTrie()
      const leaf = trie.insert(['ctrl+p', 'a', 'b'])
      const keyATrie = trie.get('ctrl+p').get('a')
      const success = leaf.parent.delete(leaf)

      assert(success, 'delete was unsucessful')
      assert.isUndefined(trie.get('ctrl+p'), 'still has ctrl+p leaf')
      assert.isUndefined(keyATrie.get('b'), 'keyAtrie still has b key child')
    })

    it('preserves parents with other tries', () => {
      const trie = new RadixTrie()
      trie.insert(['ctrl+p', 'a', 'b'])
      const otherLeaf = trie.insert(['ctrl+p', 'a', 'c'])
      const keyATrie = trie.get('ctrl+p').get('a')
      const keyCTrie = keyATrie.get('c')
      const success = otherLeaf.parent.delete(otherLeaf)

      assert(success, 'delete was unsucessful')
      assert.equal(keyCTrie.children.length, 0, '`c` trie still has children')
    })
  })
})
