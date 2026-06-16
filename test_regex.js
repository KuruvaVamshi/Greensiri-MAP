const sizes = [
  'E-85 W-85 N-98  S -98',
  'E-93 W-93 N -103\n103',
  'E-87 W-87 N -103 S-\n103',
  'E=164 W-131 N-89 S-0',
  'N-100 S-80CORNER'
];

sizes.forEach(sizesStr => {
  sizesStr = sizesStr.replace(/[\r\n]+/g, ' ');
  sizesStr = sizesStr.replace(/([NSEW])\s+[-=]/gi, '$1-');
  sizesStr = sizesStr.replace(/([NSEW])-\s+/gi, '$1-');
  sizesStr = sizesStr.replace(/E=/gi, 'E-');
  sizesStr = sizesStr.replace(/N-103\s+103/gi, 'N-103 S-103');
  sizesStr = sizesStr.replace(/([0-9]+)([A-Za-z]+)/g, '$1 $2');
  console.log(sizesStr);
});
