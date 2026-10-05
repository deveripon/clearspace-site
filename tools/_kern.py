from fontTools.ttLib import TTFont
def pair_kern(font, a, b):
    gpos = font['GPOS'].table
    idx = set()
    for fr in gpos.FeatureList.FeatureRecord:
        if fr.FeatureTag == 'kern': idx.update(fr.Feature.LookupListIndex)
    total = 0
    for li in sorted(idx):
        lk = gpos.LookupList.Lookup[li]
        subs = lk.SubTable
        if lk.LookupType == 9: subs = [s.ExtSubTable for s in subs]
        for st in subs:
            if getattr(st, 'LookupType', 2) != 2 and lk.LookupType not in (2, 9): continue
            cov = st.Coverage.glyphs
            if a not in cov: continue
            if st.Format == 1:
                ps = st.PairSet[cov.index(a)]
                for pvr in ps.PairValueRecord:
                    if pvr.SecondGlyph == b:
                        v = pvr.Value1; return total + (getattr(v, 'XAdvance', 0) or 0)
            elif st.Format == 2:
                c1 = st.ClassDef1.classDefs.get(a, 0); c2 = st.ClassDef2.classDefs.get(b, 0)
                v = st.Class1Record[c1].Class2Record[c2].Value1
                x = getattr(v, 'XAdvance', 0) or 0
                if x: return total + x
    return total
if __name__ == '__main__':
    f = TTFont('/usr/share/fonts/opentype/inter/InterDisplay-SemiBold.otf')
    cmap = f.getBestCmap(); s = 'Clearspace'
    g = [cmap[ord(c)] for c in s]
    print(f['head'].unitsPerEm, f['OS/2'].sCapHeight, f['OS/2'].sxHeight, [pair_kern(f, g[i], g[i+1]) for i in range(len(g)-1)])
