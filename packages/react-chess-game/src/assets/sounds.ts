export type Sound = "check" | "move" | "capture" | "gameOver";
export type Sounds = Record<Sound, HTMLAudioElement>;

const SILENCE = "Li4vU2lsZW5jZS5vZ2c=";

export const defaultSounds: Record<Sound, string> = {
  move: "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",
  capture:
    "T2dnUwACAAAAAAAAAADPNAAAAAAAADwcwn8BHgF2b3JiaXMAAAAAAUSsAAAAAAAAAHcBAAAAAAC4AU9nZ1MAAAAAAAAAAAAAzzQAAAEAAAAWcbXCEJ///////////////////8kDdm9yYmlzKwAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTIwMjAzIChPbW5pcHJlc2VudCkDAAAAHgAAAFRJVExFPVdvb2RlbiBwaWVjZSAtIHNoYXJwIGhpdCcAAABDb3B5cmlnaHQ9Q29weXJpZ2h0IDIwMDAsIFNvdW5kZG9ncy5jb20TAAAAU29mdHdhcmU9QXdDKysgdjIuMQEFdm9yYmlzKUJDVgEACAAAADFMIMWA0JBVAAAQAABgJCkOk2ZJKaWUoSh5mJRISSmllMUwiZiUicUYY4wxxhhjjDHGGGOMIDRkFQAABACAKAmOo+ZJas45ZxgnjnKgOWlOOKcgB4pR4DkJwvUmY26mtKZrbs4pJQgNWQUAAAIAQEghhRRSSCGFFGKIIYYYYoghhxxyyCGnnHIKKqigggoyyCCDTDLppJNOOumoo4466ii00EILLbTSSkwx1VZjrr0GXXxzzjnnnHPOOeecc84JQkNWAQAgAAAEQgYZZBBCCCGFFFKIKaaYcgoyyIDQkFUAACAAgAAAAABHkRRJsRTLsRzN0SRP8ixREzXRM0VTVE1VVVVVdV1XdmXXdnXXdn1ZmIVbuH1ZuIVb2IVd94VhGIZhGIZhGIZh+H3f933f930gNGQVACABAKAjOZbjKaIiGqLiOaIDhIasAgBkAAAEACAJkiIpkqNJpmZqrmmbtmirtm3LsizLsgyEhqwCAAABAAQAAAAAAKBpmqZpmqZpmqZpmqZpmqZpmqZpmmZZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZlmVZQGjIKgBAAgBAx3Ecx3EkRVIkx3IsBwgNWQUAyAAACABAUizFcjRHczTHczzHczxHdETJlEzN9EwPCA1ZBQAAAgAIAAAAAABAMRzFcRzJ0SRPUi3TcjVXcz3Xc03XdV1XVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVYHQkFUAAAQAACGdZpZqgAgzkGEgNGQVAIAAAAAYoQhDDAgNWQUAAAQAAIih5CCa0JrzzTkOmuWgqRSb08GJVJsnuamYm3POOeecbM4Z45xzzinKmcWgmdCac85JDJqloJnQmnPOeRKbB62p0ppzzhnnnA7GGWGcc85p0poHqdlYm3POWdCa5qi5FJtzzomUmye1uVSbc84555xzzjnnnHPOqV6czsE54Zxzzonam2u5CV2cc875ZJzuzQnhnHPOOeecc84555xzzglCQ1YBAEAAAARh2BjGnYIgfY4GYhQhpiGTHnSPDpOgMcgppB6NjkZKqYNQUhknpXSC0JBVAAAgAACEEFJIIYUUUkghhRRSSCGGGGKIIaeccgoqqKSSiirKKLPMMssss8wyy6zDzjrrsMMQQwwxtNJKLDXVVmONteaec645SGultdZaK6WUUkoppSA0ZBUAAAIAQCBkkEEGGYUUUkghhphyyimnoIIKCA1ZBQAAAgAIAAAA8CTPER3RER3RER3RER3RER3P8RxREiVREiXRMi1TMz1VVFVXdm1Zl3Xbt4Vd2HXf133f141fF4ZlWZZlWZZlWZZlWZZlWZZlCUJDVgEAIAAAAEIIIYQUUkghhZRijDHHnINOQgmB0JBVAAAgAIAAAAAAR3EUx5EcyZEkS7IkTdIszfI0T/M00RNFUTRNUxVd0RV10xZlUzZd0zVl01Vl1XZl2bZlW7d9WbZ93/d93/d93/d93/d939d1IDRkFQAgAQCgIzmSIimSIjmO40iSBISGrAIAZAAABACgKI7iOI4jSZIkWZImeZZniZqpmZ7pqaIKhIasAgAAAQAEAAAAAACgaIqnmIqniIrniI4oiZZpiZqquaJsyq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7rukBoyCoAQAIAQEdyJEdyJEVSJEVyJAcIDVkFAMgAAAgAwDEcQ1Ikx7IsTfM0T/M00RM90TM9VXRFFwgNWQUAAAIACAAAAAAAwJAMS7EczdEkUVIt1VI11VItVVQ9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV1TRN0zSB0JCVAAAZAAAjQQYZhBCKcpBCbj1YCDHmJAWhOQahxBiEpxAzDDkNInSQQSc9uJI5wwzz4FIoFURMg40lN44gDcKmXEnlOAhCQ1YEAFEAAIAxyDHEGHLOScmgRM4xCZ2UyDknpZPSSSktlhgzKSWmEmPjnKPSScmklBhLip2kEmOJrQAAgAAHAIAAC6HQkBUBQBQAAGIMUgophZRSzinmkFLKMeUcUko5p5xTzjkIHYTKMQadgxAppRxTzinHHITMQeWcg9BBKAAAIMABACDAQig0ZEUAECcA4HAkz5M0SxQlSxNFzxRl1xNN15U0zTQ1UVRVyxNV1VRV2xZNVbYlTRNNTfRUVRNFVRVV05ZNVbVtzzRl2VRV3RZV1bZl2xZ+V5Z13zNNWRZV1dZNVbV115Z9X9ZtXZg0zTQ1UVRVTRRV1VRV2zZV17Y1UXRVUVVlWVRVWXZlWfdVV9Z9SxRV1VNN2RVVVbZV2fVtVZZ94XRVXVdl2fdVWRZ+W9eF4fZ94RhV1dZN19V1VZZ9YdZlYbd13yhpmmlqoqiqmiiqqqmqtm2qrq1bouiqoqrKsmeqrqzKsq+rrmzrmiiqrqiqsiyqqiyrsqz7qizrtqiquq3KsrCbrqvrtu8LwyzrunCqrq6rsuz7qizruq3rxnHrujB8pinLpqvquqm6um7runHMtm0co6rqvirLwrDKsu/rui+0dSFRVXXdlF3jV2VZ921fd55b94WybTu/rfvKceu60vg5z28cubZtHLNuG7+t+8bzKz9hOI6lZ5q2baqqrZuqq+uybivDrOtCUVV9XZVl3zddWRdu3zeOW9eNoqrquirLvrDKsjHcxm8cuzAcXds2jlvXnbKtC31jyPcJz2vbxnH7OuP2daOvDAnHjwAAgAEHAIAAE8pAoSErAoA4AQAGIecUUxAqxSB0EFLqIKRUMQYhc05KxRyUUEpqIZTUKsYgVI5JyJyTEkpoKZTSUgehpVBKa6GU1lJrsabUYu0gpBZKaS2U0lpqqcbUWowRYxAy56RkzkkJpbQWSmktc05K56CkDkJKpaQUS0otVsxJyaCj0kFIqaQSU0mptVBKa6WkFktKMbYUW24x1hxKaS2kEltJKcYUU20txpojxiBkzknJnJMSSmktlNJa5ZiUDkJKmYOSSkqtlZJSzJyT0kFIqYOOSkkptpJKTKGU1kpKsYVSWmwx1pxSbDWU0lpJKcaSSmwtxlpbTLV1EFoLpbQWSmmttVZraq3GUEprJaUYS0qxtRZrbjHmGkppraQSW0mpxRZbji3GmlNrNabWam4x5hpbbT3WmnNKrdbUUo0txppjbb3VmnvvIKQWSmktlNJiai3G1mKtoZTWSiqxlZJabDHm2lqMOZTSYkmpxZJSjC3GmltsuaaWamwx5ppSi7Xm2nNsNfbUWqwtxppTS7XWWnOPufVWAADAgAMAQIAJZaDQkJUAQBQAAEGIUs5JaRByzDkqCULMOSepckxCKSlVzEEIJbXOOSkpxdY5CCWlFksqLcVWaykptRZrLQAAoMABACDABk2JxQEKDVkJAEQBACDGIMQYhAYZpRiD0BikFGMQIqUYc05KpRRjzknJGHMOQioZY85BKCmEUEoqKYUQSkklpQIAAAocAAACbNCUWByg0JAVAUAUAABgDGIMMYYgdFQyKhGETEonqYEQWgutddZSa6XFzFpqrbTYQAithdYySyXG1FpmrcSYWisAAOzAAQDswEIoNGQlAJAHAEAYoxRjzjlnEGLMOegcNAgx5hyEDirGnIMOQggVY85BCCGEzDkIIYQQQuYchBBCCKGDEEIIpZTSQQghhFJK6SCEEEIppXQQQgihlFIKAAAqcAAACLBRZHOCkaBCQ1YCAHkAAIAxSjkHoZRGKcYglJJSoxRjEEpJqXIMQikpxVY5B6GUlFrsIJTSWmw1dhBKaS3GWkNKrcVYa64hpdZirDXX1FqMteaaa0otxlprzbkAANwFBwCwAxtFNicYCSo0ZCUAkAcAgCCkFGOMMYYUYoox55xDCCnFmHPOKaYYc84555RijDnnnHOMMeecc845xphzzjnnHHPOOeecc44555xzzjnnnHPOOeecc84555xzzgkAACpwAAAIsFFkc4KRoEJDVgIAqQAAABFWYowxxhgbCDHGGGOMMUYSYowxxhhjbDHGGGOMMcaYYowxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGFtrrbXWWmuttdZaa6211lprrQBAvwoHAP8HG1ZHOCkaCyw0ZCUAEA4AABjDmHOOOQYdhIYp6KSEDkIIoUNKOSglhFBKKSlzTkpKpaSUWkqZc1JSKiWlllLqIKTUWkottdZaByWl1lJqrbXWOgiltNRaa6212EFIKaXWWostxlBKSq212GKMNYZSUmqtxdhirDGk0lJsLcYYY6yhlNZaazHGGGstKbXWYoy1xlprSam11mKLNdZaCwDgbnAAgEiwcYaVpLPC0eBCQ1YCACEBAARCjDnnnHMQQgghUoox56CDEEIIIURKMeYcdBBCCCGEjDHnoIMQQgghhJAx5hx0EEIIIYQQOucchBBCCKGEUkrnHHQQQgghlFBC6SCEEEIIoYRSSikdhBBCKKGEUkopJYQQQgmllFJKKaWEEEIIoYQSSimllBBCCKWUUkoppZQSQgghlFJKKaWUUkIIoZRQSimllFJKCCGEUkoppZRSSgkhhFBKKaWUUkopIYQSSimllFJKKaUAAIADBwCAACPoJKPKImw04cIDUGjISgCADAAAcdhq6ynWyCDFnISWS4SQchBiLhFSijlHsWVIGcUY1ZQxpRRTUmvonGKMUU+dY0oxw6yUVkookYLScqy1dswBAAAgCAAwECEzgUABFBjIAIADhAQpAKCwwNAxXAQE5BIyCgwKx4Rz0mkDABCEyAyRiFgMEhOqgaJiOgBYXGDIB4AMjY20iwvoMsAFXdx1IIQgBCGIxQEUkICDE2544g1PuMEJOkWlDgIAAAAAAAEAHgAAkg0gIiKaOY4Ojw+QEJERkhKTE5QAAAAAAOABgA8AgCQFiIiIZo6jw+MDJERkhKTE5AQlAAAAAAAAAAAACAgIAAAAAAAEAAAACAhPZ2dTAAQAPwAAAAAAAM80AAACAAAAFGk+EBoBD3QmJS0tLy+1JistsZ2ZimMjGRgWEhEPAQDaZfyfI31BABsAAAAAAADWZfz3MF9KgbGpIfaKQOIRSc+3AAAA96+6YDvaPzAM5YN8sTLkMwHryfJLdf8mCfz/3v//f0tjUwBKWgD4SC8H4B5tRwIAgE30+hOTbAUA2igCgHtSz7YC8HgwjgjQDjzx5VqhnWMTfNJUCWt0OHZ4rAD3J/QccRdd0nrHhNJ82DVLEVgBr215KCG955L6fk9UxM+g2BU5lzsBDB31eyEUdQHJG+YxEwOMAgZaL0QilsokPZ8R/0bS1f/vPa4VACQdiz9kUV3pkpkKBJD9z0SCUsCgMc+1D+v61st2+tIsNvQlaH+gc5ETuNu/AMQdy34qRfrGP6XgndK3FVYt/B+3j4n1+IA4zrmhu3ucDqqSM9+nqZ0MiNwqALRuC3/IiO/DoysmKPvgIhWcDWDc+nxt/ffy+s3EAOhGf9A8+JQWvGXiLbFUN00ALHqvvHne/CX/wakSrmIgA8xSC2zDbn+MT9WF2xujR93zHPrW2Wa2qm6jh7eTDgBSuNzA/aPi+r5YzHU4VEsoGz8+t/sOZO48B9hGIF2pAknY5sJUIVuiTQAAcAf0YPDpeetZfX3+TD2Sba8dvv/apU3z85eybX5+/kJ1iReaIAJ4MtLa/IVXvjo8/dqfozOKnmjhFZRkXSj/SSd2OpaQNTOzAs+UZvemvo/S6wNyu/4igIbILXsaQHJurNZa6Q3QUPoW2hWEs96gwAkWpTCNM+xfnpewJa9NExvXBr2oVQAAUBYA3B09T2IcO70Ia/F2Hx+AQeFuiK04HIdXksauN0p2ZbvMTL7OoAP0Hf2ftkHPnpyKoP+3AKsWwvJRE+/pVPcelFzQufjsJW/R4vR0InwdMyAAbFqLvz3S2vUvdJ+8r1YjqhY2Zd9Phb3sul++A8efFazJB92dyO/LLZr/EgAAumcMiO863MewuPptlJUi8HMbT7d4me5gkLEdMI4Z9G0M5GwJkhISAADhYrtHuK20o5mfnrOM0YWf9aHvazJ7tunKhU0CS5s/u/Lr/1e/sOYE2srDEMZgD91F5jpbfPqzl1JSUuLs80oBMHd3n+u83woFOHr5pfUG+QDALngGmEyV6EAW7lIjguHzyo1RDFg4A7ggjJo6zvIgAW6xzyW1xkTCiP8pDgAqDB0K8B0DAAAAfmYkwWeXX9IviqePuWCh7kclSBDaEIFxTKUEyYoQAQCa5gHX0NPXm5Aq6vW8lf2U72h/VObN3sb7R2diK/csA/aPx7GhGG+Nv0MCCRbKfH3E+9laEMxZJ9SlQN8JO6QPN5XAA6XgClTM/96SMZTYYmm4NcBg5LDQd7tusHCCqcq/v5ald7iUpl5AYd8cY+8jBR7AmcPvBkCBCosAAF5mnMUtcndDVT29fYT7uMKzOqDaLiESPUoAANgf3pWzl99mRq7l2exfyrcx5j/bnI1LYnp6ejc9rY/eg5T8rLBs3FsR9ZeO4HE991YNLSuDNaloeTgPf0cA301bZaJZA1gNdczLq7eQCLW91ZFqDVFotrlp5arKWv23FYL5CZa06IACRw+rsyWYmqL9Fy2b8FUUWIEbX4mdAN5lfMt9oKog2kg5tTf96AMYu1QJCWYKAOAs/4X5dzp47pxeTyz3bM2w9SZ1fSnfqJPmqXi+Hl+XkkDTxkVxaME2aQ++6psX1NaoSTxAlyCxAPjNpwmKRZlkEQCt8gU1cRqD7zMBQFVJTk5fVam/Wrj2L+8nLBo8YveSTn6o7iVbds562OtgA2ieAH5l/F3qvTUFbOBUGfv2S4BsbSkTUAYAgDFfWibq/84qiQ98lXl2y35j31syL1utJar5dhaHrI1YIsGWTI6s+3UV0gtspTffgx+IYaKQYIf8CTg260VNmwFAZ9+iAB3wdIAgAJ5l/HuUO00BG/AoBQBQAAC2jZs53uWe3dPsoAO3WYPwAJAAvmX8556+oIANMAAATAEAgGIWEoDEBE0mAN5l/J8jfUEBGwAAEBAQUAAAJgBMAP3QBt5l/J8jfUEBGwAAgDIBAABgwwSAhwTeZfyfI31BAQcAAAAEAAAA2BveZfyfI31BARsAAIACAAAAG95l/O8sX0oBGwAAAAAAAA4=",
  check: SILENCE,
  gameOver:
    "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",
};