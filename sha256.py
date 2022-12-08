
def strToBin(msg):
    charcodes = [ord(c) for c in msg]
    binary = [bin(code)[2:].zfill(8) for code in charcodes]
    res = []
    for bins in binary:
        for bit in bins:
            res.append(int(bit))
    return res

def binToHex(binary):
    binary = ''.join([str(bit) for bit in binary])
    binary_4 = ["0b" + binary[i:i+4] for i in range(0, len(binary), 4)]
    res = ''
    for bin in binary_4:
        res += hex(int(bin, 2))[2:]
    return res

def padZeroes(str, pad_len, endian="LE"):
    temp = [0 for i in range(0, pad_len-len(str))]
    if endian == "LE":
        str += temp
    else:
        str = temp + str
    return str

def chunker(str, chunk_size):
    return [str[i: i+chunk_size] for i in range(0, len(str), chunk_size)]

def hexToBin(hexes):
    binary = [bin(int(hex, 16))[2:] for hex in hexes]

    res=[]
    for bins in binary:
        bits = [int(bit) for bit in bins]
        res.append(padZeroes(bits, 32, 'BE'))
    return res

def padMsg(msg):
    msg = strToBin(msg)
    
    msg_len = len(msg)
    msg_len_bin = [int(bit) for bit in bin(msg_len)[2:].zfill(64)]
    msg.append(1)

    if (msg_len % 512) < 512-64:
        msg = padZeroes(msg, (1 + int(msg_len/512))*512-64)
    else:
        msg = padZeroes(msg, (2 + int(msg_len/512))*512-64)
    
    msg += msg_len_bin
    return chunker(msg, 512)

def isTrue(x): 
    return x == 1

def if_(i, y, z): 
    return y if isTrue(i) else z

def and_(i, j): 
    return if_(i, j, 0)

def AND(i, j): 
    return [and_(ia, ja) for ia, ja in zip(i,j)] 

def not_(i): 
    return if_(i, 0, 1)

def NOT(i): 
    return [not_(x) for x in i]

def xor(i, j): 
    return if_(i, not_(j), j)

def XOR(i, j): 
    return [xor(ia, ja) for ia, ja in zip(i, j)]

def xorxor(i, j, l): 
    return xor(i, xor(j, l))

def XORXOR(i, j, l): 
    return [xorxor(ia, ja, la) for ia, ja, la, in zip(i, j, l)]
 
def maj(i,j,k): 
    return max([i,j,], key=[i,j,k].count)

def rotr(x, n): 
    return x[-n:] + x[:-n]

def shr(x, n): 
    return n * [0] + x[:-n]

def add(i, j):
    length = len(i)
    sums = list(range(length))
    c = 0
    for x in range(length-1,-1,-1):
        sums[x] = xorxor(i[x], j[x], c)
        c = maj(i[x], j[x], c)
    return sums

def sha256(message): 
    h = ['0x6a09e667', '0xbb67ae85', '0x3c6ef372', '0xa54ff53a', '0x510e527f', '0x9b05688c', '0x1f83d9ab', '0x5be0cd19']
    k = ['0x428a2f98', '0x71374491', '0xb5c0fbcf', '0xe9b5dba5', '0x3956c25b', '0x59f111f1', '0x923f82a4','0xab1c5ed5', '0xd807aa98', '0x12835b01', '0x243185be', '0x550c7dc3', '0x72be5d74', '0x80deb1fe','0x9bdc06a7', '0xc19bf174', '0xe49b69c1', '0xefbe4786', '0x0fc19dc6', '0x240ca1cc', '0x2de92c6f','0x4a7484aa', '0x5cb0a9dc', '0x76f988da', '0x983e5152', '0xa831c66d', '0xb00327c8', '0xbf597fc7','0xc6e00bf3', '0xd5a79147', '0x06ca6351', '0x14292967', '0x27b70a85', '0x2e1b2138', '0x4d2c6dfc','0x53380d13', '0x650a7354', '0x766a0abb', '0x81c2c92e', '0x92722c85', '0xa2bfe8a1', '0xa81a664b','0xc24b8b70', '0xc76c51a3', '0xd192e819', '0xd6990624', '0xf40e3585', '0x106aa070', '0x19a4c116','0x1e376c08', '0x2748774c', '0x34b0bcb5', '0x391c0cb3', '0x4ed8aa4a', '0x5b9cca4f', '0x682e6ff3','0x748f82ee', '0x78a5636f', '0x84c87814', '0x8cc70208', '0x90befffa', '0xa4506ceb', '0xbef9a3f7','0xc67178f2']

    k = hexToBin(k)
    h0, h1, h2, h3, h4, h5, h6, h7 = hexToBin(h)

    chunks = padMsg(message)
    for chunk in chunks:
        w = chunker(chunk, 32)
        for _ in range(48):
            w.append(32 * [0])
        for i in range(16, 64):
            s0 = XORXOR(rotr(w[i-15], 7), rotr(w[i-15], 18), shr(w[i-15], 3) ) 
            s1 = XORXOR(rotr(w[i-2], 17), rotr(w[i-2], 19), shr(w[i-2], 10))
            w[i] = add(add(add(w[i-16], s0), w[i-7]), s1)
        a = h0
        b = h1
        c = h2
        d = h3
        e = h4
        f = h5
        g = h6
        h = h7
        for j in range(64):
            S1 = XORXOR(rotr(e, 6), rotr(e, 11), rotr(e, 25) )
            ch = XOR(AND(e, f), AND(NOT(e), g))
            temp1 = add(add(add(add(h, S1), ch), k[j]), w[j])
            S0 = XORXOR(rotr(a, 2), rotr(a, 13), rotr(a, 22))
            m = XORXOR(AND(a, b), AND(a, c), AND(b, c))
            temp2 = add(S0, m)
            h = g
            g = f
            f = e
            e = add(d, temp1)
            d = c
            c = b
            b = a
            a = add(temp1, temp2)
        h0 = add(h0, a)
        h1 = add(h1, b)
        h2 = add(h2, c)
        h3 = add(h3, d)
        h4 = add(h4, e)
        h5 = add(h5, f)
        h6 = add(h6, g)
        h7 = add(h7, h)
    digest = ''
    for val in [h0, h1, h2, h3, h4, h5, h6, h7]:
        digest += binToHex(val)
    return digest

#example used above
hash_example = sha256('hello world')
print('example: ', hash_example)#bit length: 0
hash_0 = sha256('')
vector_hash_0 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
print('bit size 0: ', hash_0 == vector_hash_0)#bit length: 24
hash_24 = sha256('abc')
vector_hash_24 = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
print('bit size 24: ', hash_24 == vector_hash_24)#bit length: 448
hash_448 = sha256('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')
vector_hash_448 = '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'
print('bit size 448: ', hash_448 == vector_hash_448)#bit length: 896
hash_896 = sha256('abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu')
vector_hash_896 = 'cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1'
print('bit size 896: ', hash_896 == vector_hash_896)