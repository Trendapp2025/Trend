import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelectorButton } from "@/components/language-selector";
import ShareApp from "@/components/share-app";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrendingUp, LogOut, User, Trophy, Shield } from "lucide-react";
import { Link } from "wouter";

export default function AppHeader() {
  const { user, logoutMutation } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="border-b bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-primary">
          <TrendingUp className="h-6 w-6" />
          <span className="font-bold text-xl">Trend</span>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Leaderboard - Testo visibile solo su schermi più grandi */}
          <Button variant="ghost" asChild size="sm" className="px-2 sm:px-3">
            <Link href="/leaderboard" className="flex items-center">
              <Trophy className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("nav.leaderboard")}</span>
            </Link>
          </Button>
          
          <LanguageSelectorButton />
          <ThemeToggle />
          <ShareApp variant="icon" size="sm" />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="flex w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t("nav.profile")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer md:hidden">
                  <Link href="/leaderboard" className="flex w-full">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>{t("nav.leaderboard")}</span>
                  </Link>
                </DropdownMenuItem>
                {user?.username === "admin" && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/admin" className="flex w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>{t("admin.dashboard")}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("nav.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {/* Versione desktop dei pulsanti Login/Register */}
              <div className="hidden sm:flex sm:space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/auth">{t("nav.login")}</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth">{t("nav.register")}</Link>
                </Button>
              </div>
              
              {/* Versione mobile: Menu dropdown per login/register */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="sm:hidden">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="end">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/auth" className="flex w-full">
                      <span>{t("nav.login")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/auth" className="flex w-full">
                      <span>{t("nav.register")}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
