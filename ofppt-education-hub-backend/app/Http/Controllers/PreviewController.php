<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class PreviewController extends Controller
{
    public function github(Request $req)
    {
        $data = $req->validate([
            'url' => ['required', 'url']
        ]);

        [$owner, $repo] = $this->parseGithubUrl($data['url']);

        $http = Http::acceptJson()->withHeaders([
            'Accept' => 'application/vnd.github+json',
            'X-GitHub-Api-Version' => '2022-11-28'
        ]);

        $repoResponse = $http->get("https://api.github.com/repos/$owner/$repo");

        if($repoResponse->failed()){
            return response()->json([
                'message' => 'Github repo not found'
            ], 404);
        }

        $repoData = $repoResponse->json();

        $contentResponse = $http->get(
            "https://api.github.com/repos/$owner/$repo/contents",
            ['ref' => $repoData['default_branch']]
        );

        if($contentResponse->failed()){
            return response()->json([
                'message' => 'Could not read repo content'
            ], 400);
        }

        $items = collect($contentResponse->json());

        // $importantNames = [
        //     'readme.md',
        //     'package.json',
        //     'composer.json',
        //     'artisan',
        //     'vite.config.js',
        //     '.env.example',
        //     'dockerfile',
        //     'docker-compose.yml',
        //     'requirements.txt',
        // ];

        $folders = $items
                    ->where('type', 'dir')
                    ->map(function($folder) {
                        return [
                            'name' => $folder['name'],
                            'path' => $folder['path'],
                            'url' => $folder['html_url'],
                        ];
                    })
                    ->values();

        $files = $items
                    ->where('type', 'file')
                    ->filter(function($file){
                        return $file['name'];
                    })
                    ->map(function($file){
                        return [
                            'name' => $file['name'],
                            'path' => $file['path'],
                            'url' => $file['html_url']
                        ];
                    })
                    ->values();

        return response()->json([
            'provider' => 'github',
            'repository' => [
                'name' => $repoData['name'],
                'full_name' => $repoData['full_name'],
                'description' => $repoData['description']
            ],
            'top_folders' => $folders,
            'important_files' => $files
        ]);
    }

    private function parseGithubUrl(string $url): array
    {
        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');

        if(!in_array($host, ['github.com', 'www.github.com'])){
            throw ValidationException::withMessages([
                'url' => 'The URL must be a Github repo link !'
            ]);
        }

        $path = trim(parse_url($url, PHP_URL_PATH) ?? '', '/');
        $parts = explode('/', $path);

        if(count($parts) < 2){
            throw ValidationException::withMessages([
                'url' => 'Invalid Github repo URL !'
            ]);
        }

        $owner = $parts[0];
        $repo = preg_replace('/\.git$/', '', $parts[1]);

        return [$owner, $repo];
    }

    public function drive(Request $req)
    {
        $data = $req->validate([
            'url' => ['required', 'url']
        ]);

        $fileId = $this->parseDriveFileId($data['url']);

        return response()->json([
            'provider' => 'drive',
            'file_id' => $fileId,
            'original_url' => $data['url'],
            'preview_url' => "https://drive.google.com/file/d/{$fileId}/view",
            'embed_url' => "https://drive.google.com/file/d/{$fileId}/preview",
            'download_url' => "https://drive.google.com/uc?export=download&id={$fileId}",
        ]);
    }

    private function parseDriveFileId(string $url): string
    {
        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');

        if (!in_array($host, ['drive.google.com', 'docs.google.com'])) {
            throw ValidationException::withMessages([
                'url' => 'The URL must be a Google Drive link!'
            ]);
        }

        $path = parse_url($url, PHP_URL_PATH) ?? '';

        if (preg_match('#/file/d/([^/]+)#', $path, $matches)) {
            return $matches[1];
        }

        parse_str(parse_url($url, PHP_URL_QUERY) ?? '', $query);

        if (!empty($query['id'])) {
            return $query['id'];
        }

        throw ValidationException::withMessages([
            'url' => 'Invalid Google Drive file URL!'
        ]);
    }
}
