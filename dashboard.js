function showSection(sectionId) {
      let sections = document.querySelectorAll('.section');
      sections.forEach(sec => sec.style.display = 'none');
      document.getElementById(sectionId).style.display = 'block';
    }