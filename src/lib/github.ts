export async function fetchGithubRepo(repoFullName: string) {
  const pat = import.meta.env?.GITHUB_PAT || process.env.GITHUB_PAT;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    ...(pat ? { 'Authorization': `token ${pat}` } : {})
  };

  const response = await fetch(`https://api.github.com/repos/${repoFullName}`, { headers });
  if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);
  return response.json();
}

export async function fetchGithubReadme(repoFullName: string) {
  // Fetch from raw.githubusercontent.com bypasses API rate limits!
  let response = await fetch(`https://raw.githubusercontent.com/${repoFullName}/main/README.md`);
  if (!response.ok) {
    // Try master branch if main doesn't exist
    response = await fetch(`https://raw.githubusercontent.com/${repoFullName}/master/README.md`);
  }
  if (!response.ok) {
    if (response.status === 404) return "";
    throw new Error(`GitHub raw fetch error: ${response.statusText}`);
  }
  return response.text();
}

export async function fetchGithubUserRepos(username: string) {
  const pat = import.meta.env?.GITHUB_PAT || process.env.GITHUB_PAT;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    ...(pat ? { 'Authorization': `token ${pat}` } : {})
  };

  const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
  if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);
  return response.json();
}
